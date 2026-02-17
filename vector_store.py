import os
from glob import glob
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
import hashlib

def build_vector_db(persist_directory: str = "./chroma_db", knowledge_base_path: str = "./knowledge"):
    """
    Build or load vector database, supporting batch loading of multiple PDF files.
    
    Args:
        persist_directory: Directory for vector database persistence
        knowledge_base_path: Directory containing PDF knowledge base files
    
    Returns:
        Retriever
    """
    
    # 1. Check and collect all PDF files
    if not os.path.exists(knowledge_base_path):
        os.makedirs(knowledge_base_path, exist_ok=True)
        print(f"⚠️  Note: Knowledge base directory '{knowledge_base_path}' created, but contains no PDF files.")
        print(f"   Please place your PDF files in this directory and restart the application.")
        # Return an empty retriever as a fallback
        from langchain_core.retrievers import BaseRetriever
        class EmptyRetriever(BaseRetriever):
            def _get_relevant_documents(self, query):
                return []
            async def _aget_relevant_documents(self, query):
                return []
        return EmptyRetriever()
    
    pdf_files = glob(os.path.join(knowledge_base_path, "**/*.pdf"), recursive=True)
    
    if not pdf_files:
        print(f"⚠️  Warning: No PDF files found in directory '{knowledge_base_path}'.")
        print(f"   Please ensure PDF files are placed in this directory.")
        # Return empty retriever
        from langchain_core.retrievers import BaseRetriever
        class EmptyRetriever(BaseRetriever):
            def _get_relevant_documents(self, query):
                return []
            async def _aget_relevant_documents(self, query):
                return []
        return EmptyRetriever()
    
    print(f"📚 Found {len(pdf_files)} PDF files:")
    for i, pdf_file in enumerate(pdf_files, 1):
        print(f"   {i}. {os.path.basename(pdf_file)}")
    
    # 2. Load all PDF files
    all_docs = []
    processed_hashes = set()  # For content deduplication
    
    for pdf_file in pdf_files:
        try:
            print(f"  Loading: {os.path.basename(pdf_file)}...")
            loader = PyPDFLoader(pdf_file)
            docs = loader.load()
            
            # Add metadata for each document chunk
            for doc in docs:
                # Generate content hash for deduplication
                content_hash = hashlib.md5(doc.page_content.encode()).hexdigest()
                if content_hash in processed_hashes:
                    continue  # Skip duplicate content
                processed_hashes.add(content_hash)
                
                # Enhance metadata
                doc.metadata.update({
                    "source": os.path.basename(pdf_file),
                    "source_path": pdf_file,
                    "file_size": f"{os.path.getsize(pdf_file) / 1024:.1f}KB",
                    "content_hash": content_hash
                })
                all_docs.append(doc)
            
            print(f"    Successfully loaded {len(docs)} text chunks")
            
        except Exception as e:
            print(f"    ❌ Load failed: {os.path.basename(pdf_file)} - Error: {str(e)}")
            continue
    
    if not all_docs:
        raise ValueError("No valid PDF content was successfully loaded.")
    
    print(f"✅ Total {len(all_docs)} unique text chunks loaded")
    
    # 3. Split text
    print(f"🔪 Splitting text...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\\n\\n", "\\n", ".", "!", "?", ";", ",", " ", ""]
    )
    splits = text_splitter.split_documents(all_docs)
    print(f"✅ Splitting complete, {len(splits)} text chunks total")
    
    # 4. Create or load vector database
    print(f"🧠 Building vector database...")
    
    # Check if persistent database exists
    if os.path.exists(persist_directory) and os.listdir(persist_directory):
        print(f"   Existing vector database detected, loading...")
        vectorstore = Chroma(
            persist_directory=persist_directory,
            embedding_function=HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        )
        
        # Check if update is needed (compare file modification times or existence)
        need_update = False
        existing_sources = vectorstore.get()["metadatas"]
        existing_files = {meta.get("source_path") for meta in existing_sources if "source_path" in meta}
        
        for pdf_file in pdf_files:
            if pdf_file not in existing_files:
                need_update = True
                break
        
        if need_update:
            print(f"   New PDF files detected, incrementally updating...")
            vectorstore.add_documents(splits)
        else:
            print(f"   Knowledge base is up to date, using existing database.")
    else:
        print(f"   Creating new vector database...")
        vectorstore = Chroma.from_documents(
            documents=splits,
            embedding=HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2"),
            persist_directory=persist_directory
        )
    
    print(f"✅ Vector database built successfully, stored at: {persist_directory}")
    print(f"📊 Statistics:")
    print(f"   - Total text chunks: {vectorstore._collection.count()}")
    print(f"   - Source files count: {len(pdf_files)}")
    print(f"   - Vector dimension: 384 (all-MiniLM-L6-v2)")
    
    return vectorstore.as_retriever(search_kwargs={"k": 5})

# If run as a script directly, test the functionality
if __name__ == "__main__":
    print("=" * 50)
    print("🧪 Testing vector database build...")
    retriever = build_vector_db()
    
    # Test queries
    test_queries = [
        "What is P/E ratio?",
        "What are the principles of value investing?",
        "How to analyze financial statements?"
    ]
    
    print("\n🔍 Testing retrieval function:")
    for query in test_queries:
        print(f"\nQuery: '{query}'")
        docs = retriever.invoke(query)
        if docs:
            print(f"  Found {len(docs)} relevant paragraphs:")
            for i, doc in enumerate(docs[:2]):  # Show only first 2
                print(f"  {i+1}. [{doc.metadata.get('source', 'Unknown')}] {doc.page_content[:100]}...")
        else:
            print("  No relevant content found")
    print("=" * 50)