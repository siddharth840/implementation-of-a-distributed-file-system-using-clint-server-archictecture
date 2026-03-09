import requests
import os
import time

BASE_URL = "http://localhost:8000"

def test_flow():
    print("--- Starting NimbusFS Backend Verification ---")
    
    # 1. Check if server is up
    try:
        response = requests.get(f"{BASE_URL}/stats")
        print(f"Stats check: {response.status_code}")
        print(f"Initial Stats: {response.json()}")
    except requests.exceptions.ConnectionError:
        print(f"\n❌ Error: Could not connect to the backend at {BASE_URL}.")
        print("👉 Make sure the backend server is running.")
        print("👉 Try running 'run.bat' from the project root to start both servers.\n")
        return
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return

    # 2. Upload a test file
    test_filename = "test_distributed.txt"
    with open(test_filename, "w") as f:
        f.write("This is a test of the distributed file system simulator.")
    
    with open(test_filename, "rb") as f:
        files = {'file': (test_filename, f)}
        response = requests.post(f"{BASE_URL}/upload", files=files)
        print(f"Upload check: {response.status_code}")
    
    # 3. Verify replication
    nodes = ["node1", "node2", "node3"]
    all_replicated = True
    
    # Try to find the storage directory relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    possible_storage_paths = [
        os.path.join(script_dir, "backend", "storage"),
        os.path.join(script_dir, "storage"),
    ]
    
    storage_root = None
    for p in possible_storage_paths:
        if os.path.exists(p):
            storage_root = p
            break
            
    if not storage_root:
        print("❌ Could not locate the storage directory for verification.")
        all_replicated = False
    else:
        for node in nodes:
            path = os.path.join(storage_root, node, test_filename)
            if os.path.exists(path):
                print(f"✅ File found in {node}")
            else:
                print(f"❌ File MISSING in {node}")
                all_replicated = False
    
    if all_replicated:
        print("Replication Success!")
    
    # 4. Lock file
    response = requests.post(f"{BASE_URL}/lock/{test_filename}")
    print(f"Lock check: {response.json().get('locked')}")
    
    # 5. Try delete locked file (should fail)
    response = requests.delete(f"{BASE_URL}/file/{test_filename}")
    print(f"Delete locked file check: {response.status_code} (Expected 400)")
    
    # 6. Unlock and delete
    requests.post(f"{BASE_URL}/unlock/{test_filename}")
    response = requests.delete(f"{BASE_URL}/file/{test_filename}")
    print(f"Delete unlocked file check: {response.status_code} (Expected 200)")
    
    # Cleanup
    if os.path.exists(test_filename):
        os.remove(test_filename)
        
    print("--- Verification Complete ---")

if __name__ == "__main__":
    time.sleep(2) # Wait for uvicorn
    test_flow()
