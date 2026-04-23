import hashlib
import os
from glob import glob
from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from runtime_config import CHROMA_DB_DIR, KNOWLEDGE_BASE_PATH


def build_vector_db(
    persist_directory: str | None = None,
    knowledge_base_path: str | None = None,
):
    """
    Build or load a PDF-backed vector database and return a retriever.
    """

    persist_path = Path(persist_directory).resolve() if persist_directory else CHROMA_DB_DIR
    knowledge_path = (
        Path(knowledge_base_path).resolve()
        if knowledge_base_path
        else KNOWLEDGE_BASE_PATH
    )

    if not knowledge_path.exists():
        knowledge_path.mkdir(parents=True, exist_ok=True)
        print(f"Knowledge base directory '{knowledge_path}' was created but has no PDF files.")
        print("Place your PDF files there and restart the application.")
        return _empty_retriever()

    pdf_files = glob(os.path.join(str(knowledge_path), "**/*.pdf"), recursive=True)
    if not pdf_files:
        print(f"No PDF files found in '{knowledge_path}'.")
        return _empty_retriever()

    print(f"Found {len(pdf_files)} PDF files for the knowledge base.")

    all_docs = []
    processed_hashes = set()

    for pdf_file in pdf_files:
        try:
            print(f"Loading {os.path.basename(pdf_file)}...")
            loader = PyPDFLoader(pdf_file)
            docs = loader.load()

            for doc in docs:
                content_hash = hashlib.md5(doc.page_content.encode()).hexdigest()
                if content_hash in processed_hashes:
                    continue

                processed_hashes.add(content_hash)
                doc.metadata.update(
                    {
                        "source": os.path.basename(pdf_file),
                        "source_path": pdf_file,
                        "file_size": f"{os.path.getsize(pdf_file) / 1024:.1f}KB",
                        "content_hash": content_hash,
                    }
                )
                all_docs.append(doc)
        except Exception as error:
            print(f"Failed to load {os.path.basename(pdf_file)}: {error}")

    if not all_docs:
        raise ValueError("No valid PDF content was successfully loaded.")

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", "!", "?", ";", ",", " ", ""],
    )
    splits = text_splitter.split_documents(all_docs)

    persist_path.mkdir(parents=True, exist_ok=True)
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    if any(persist_path.iterdir()):
        print(f"Loading existing vector database from {persist_path}...")
        vectorstore = Chroma(
            persist_directory=str(persist_path),
            embedding_function=embeddings,
        )

        existing_sources = vectorstore.get().get("metadatas", [])
        existing_files = {
            metadata.get("source_path")
            for metadata in existing_sources
            if isinstance(metadata, dict) and metadata.get("source_path")
        }

        if any(pdf_file not in existing_files for pdf_file in pdf_files):
            print("New PDF files detected. Updating vector store...")
            vectorstore.add_documents(splits)
    else:
        print(f"Creating new vector database at {persist_path}...")
        vectorstore = Chroma.from_documents(
            documents=splits,
            embedding=embeddings,
            persist_directory=str(persist_path),
        )

    print(f"Vector database ready at {persist_path}.")
    return vectorstore.as_retriever(search_kwargs={"k": 5})


def _empty_retriever():
    from langchain_core.retrievers import BaseRetriever

    class EmptyRetriever(BaseRetriever):
        def _get_relevant_documents(self, query):
            return []

        async def _aget_relevant_documents(self, query):
            return []

    return EmptyRetriever()


if __name__ == "__main__":
    retriever = build_vector_db()
    for query in (
        "What is P/E ratio?",
        "What are the principles of value investing?",
        "How to analyze financial statements?",
    ):
        docs = retriever.invoke(query)
        print(f"\nQuery: {query}")
        if docs:
            for index, doc in enumerate(docs[:2], start=1):
                print(
                    f"{index}. [{doc.metadata.get('source', 'Unknown')}] "
                    f"{doc.page_content[:100]}..."
                )
        else:
            print("No relevant content found.")
