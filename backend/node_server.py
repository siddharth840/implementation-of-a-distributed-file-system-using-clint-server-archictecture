from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import os
import argparse

app = FastAPI()

NODE_NAME = os.getenv("NODE_NAME", "node1")
STORAGE_DIR = os.path.join("storage", NODE_NAME)

os.makedirs(STORAGE_DIR, exist_ok=True)

@app.get("/health")
def health_check():
    return {"status": "ok", "node": NODE_NAME}

@app.post("/upload/{filename}")
async def upload_file(filename: str, file: UploadFile = File(...)):
    filepath = os.path.join(STORAGE_DIR, filename)
    try:
        content = await file.read()
        with open(filepath, "wb") as f:
            f.write(content)
        return {"message": "File uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/{filename}")
def download_file(filename: str):
    filepath = os.path.join(STORAGE_DIR, filename)
    if os.path.exists(filepath):
        return FileResponse(filepath, filename=filename)
    raise HTTPException(status_code=404, detail="File not found on this node")

@app.delete("/delete/{filename}")
def delete_file(filename: str):
    filepath = os.path.join(STORAGE_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        return {"message": "File deleted successfully"}
    # Return 200 even if it doesn't exist to ensure idempotency across nodes
    return {"message": "File not found or already deleted"}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8001)
    parser.add_argument("--node", type=str, default="node1")
    args = parser.parse_args()
    
    os.environ["NODE_NAME"] = args.node
    NODE_NAME = args.node
    STORAGE_DIR = os.path.join("storage", NODE_NAME)
    os.makedirs(STORAGE_DIR, exist_ok=True)
    
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=args.port)
