import uuid
from agent_graph import stock_agent_app

def start_interactive_session():
    print("=== Stock AI Agent Ready ===")
    print("Type 'exit' to quit.\n")
    
    # Generate a unique session ID for this run
    # This allows the SQLite database to track this specific conversation
    session_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": session_id}}
    
    print(f"Session started with ID: {session_id}\n")

    while True:
        user_input = input("User: ")
        if user_input.lower() in ['exit', 'quit', 'q']:
            print("Closing session...")
            break
            
        # The 'messages' list is appended in the graph state
        initial_state = {"messages": [("user", user_input)]}
        
        # IMPORTANT: Pass the 'config' variable as the second argument
        # This triggers the SqliteSaver to save/load memory for this thread_id
        for event in stock_agent_app.stream(initial_state, config):
            for node_name, output in event.items():
                print(f"\n[Executing Node: {node_name}]")
                
                # Retrieve the last message produced by this node
                if "messages" in output:
                    last_msg = output["messages"][-1]
                    
                    # Only print if there is text content (ignore tool-call metadata)
                    if hasattr(last_msg, 'content') and last_msg.content:
                        print(f"AI: {last_msg.content}")

if __name__ == "__main__":
    start_interactive_session()