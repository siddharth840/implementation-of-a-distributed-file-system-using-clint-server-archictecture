import requests
import time

BASE_URL = "http://localhost:8005"

def test_new_features():
    print("--- Starting NimbusFS New Features Verification ---")
    
    # 1. Upload a test file
    test_filename = "feature_test.txt"
    with open(test_filename, "w") as f:
        f.write("Testing new features: Recycle Bin, Search, and Preview.")
    
    with open(test_filename, "rb") as f:
        files = {'file': (test_filename, f)}
        requests.post(f"{BASE_URL}/upload", files=files)
    
    # 2. Test Search
    response = requests.get(f"{BASE_URL}/files?search=feature")
    files = response.json()
    if any(f['filename'] == test_filename for f in files):
        print("✅ Search Feature: PASSED")
    else:
        print("❌ Search Feature: FAILED")
    
    # 3. Test Preview
    response = requests.get(f"{BASE_URL}/preview/{test_filename}")
    if response.status_code == 200 and "Testing new features" in response.text:
        print("✅ Preview Feature: PASSED")
    else:
        print("❌ Preview Feature: FAILED")
        
    # 4. Test Soft Delete (Recycle Bin)
    requests.delete(f"{BASE_URL}/file/{test_filename}")
    
    # Verify it's not in main list
    response = requests.get(f"{BASE_URL}/files")
    if not any(f['filename'] == test_filename for f in response.json()):
        print("✅ Soft Delete (Main List): PASSED")
    else:
        print("❌ Soft Delete (Main List): FAILED")
        
    # Verify it IS in trash list
    response = requests.get(f"{BASE_URL}/files?deleted=true")
    if any(f['filename'] == test_filename for f in response.json()):
        print("✅ Soft Delete (Trash List): PASSED")
    else:
        print("❌ Soft Delete (Trash List): FAILED")
        
    # 5. Test Restore
    requests.post(f"{BASE_URL}/restore/{test_filename}")
    response = requests.get(f"{BASE_URL}/files")
    if any(f['filename'] == test_filename for f in response.json()):
        print("✅ Restore Feature: PASSED")
    else:
        print("❌ Restore Feature: FAILED")
        
    # 6. Test Permanent Delete
    requests.delete(f"{BASE_URL}/file/{test_filename}?permanent=true")
    response = requests.get(f"{BASE_URL}/files?deleted=true")
    if not any(f['filename'] == test_filename for f in response.json()):
        print("✅ Permanent Delete: PASSED")
    else:
        print("❌ Permanent Delete: FAILED")

    print("--- Verification Complete ---")

if __name__ == "__main__":
    test_new_features()
