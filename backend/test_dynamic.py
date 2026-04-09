import httpx
import os
import time

API_URL = "http://localhost:8000/upload"
NODE_URLS = [
    "http://localhost:8001/download",
    "http://localhost:8002/download",
    "http://localhost:8003/download"
]

def test_system():
    test_filename = "distributed_test.txt"
    test_content = b"This is a test of the distributed node HTTP system."
    
    print("\n[+] Testing Upload via Main Backend...")
    try:
        files = {'file': (test_filename, test_content)}
        r = httpx.post(API_URL, files=files, data={'owner': 'Admin'}, timeout=10.0)
        print(f"Upload Status: {r.status_code}")
        print(f"Response: {r.json()}")
        if r.status_code != 200:
            print("[-] Upload failed. Aborting test.")
            return
    except Exception as e:
         print(f"[-] Upload failed with exception: {e}")
         return

    time.sleep(2) # Wait for distributions
    
    # Verify file exists on all nodes
    print("\n[+] Verifying file existence on separate HTTP nodes...")
    for url in NODE_URLS:
        try:
            r = httpx.get(f"{url}/{test_filename}")
            if r.status_code == 200 and r.content == test_content:
                print(f"  [OK] File found and matches on node: {url}")
            else:
                 print(f"  [FAIL] Node {url} returned status {r.status_code}")
        except Exception as e:
             print(f"  [FAIL] Error connecting to node {url}: {e}")

    print("\n[+] Testing Dashboard Health Endpoint...")
    try:
        r = httpx.get("http://localhost:8000/nodes/health")
        print(f"Health Status: {r.status_code}")
        print(f"Response: {r.json()}")
    except Exception as e:
         print(f"[-] Health check failed with exception: {e}")
    
    print("\n[+] Testing Delete via Main Backend...")
    try:
        # Permanent delete
        r = httpx.delete(f"http://localhost:8000/file/{test_filename}?permanent=true", timeout=10.0)
        print(f"Delete Status: {r.status_code}")
        print(f"Response: {r.json()}")
    except Exception as e:
         print(f"[-] Delete failed with exception: {e}")

if __name__ == "__main__":
    test_system()
