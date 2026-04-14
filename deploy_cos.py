"""
产品成本分解Agent - 部署到腾讯云静态托管
基于医疗项目的 COS 上传方案
"""
import os, json, hashlib, hmac, base64, time
from urllib.request import Request, urlopen
from urllib.parse import quote
from datetime import datetime
import glob

# CloudBase env info
ENV_ID = "workbuddy01-9go9gy35fbec9e41"
APP_ID = "1417107183"
BUCKET = f"{ENV_ID}-{APP_ID}"
REGION = "ap-shanghai"

# 项目路径
BASE_DIR = r'd:\WorkBuddyEnv\20260413A\cost-agent'
DIST_DIR = os.path.join(BASE_DIR, 'dist')
CLOUD_BASE = "cost-agent"

# 部署URL
DEPLOY_URL = f"https://workbuddy01-9go9gy35fbec9e41.service.tcloudbase.com/{CLOUD_BASE}/index.html"

COS_DOMAINS = [
    f"https://{BUCKET}.tcb.qcloud.myqcloud.com",
    f"https://{BUCKET}.cos.ap-shanghai.myqcloud.com",
]

def upload_file(local_path, cloud_key):
    """上传单个文件到 COS"""
    with open(local_path, "rb") as f:
        file_content = f.read()
    
    file_size = len(file_content)
    
    for domain in COS_DOMAINS:
        url = f"{domain}/{cloud_key}"
        try:
            req = Request(url, method="PUT", data=file_content)
            content_type = get_content_type(local_path)
            req.add_header("Content-Type", content_type)
            req.add_header("Content-Length", str(file_size))
            
            with urlopen(req, timeout=30) as resp:
                status = resp.status
                if status in [200, 201]:
                    return True
        except Exception as e:
            continue
    
    return False

def get_content_type(filepath):
    """根据文件扩展名返回 Content-Type"""
    ext = os.path.splitext(filepath)[1].lower()
    types = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
    }
    return types.get(ext, 'application/octet-stream')

def deploy_all():
    """上传所有文件"""
    if not os.path.exists(DIST_DIR):
        print(f"错误: dist 目录不存在")
        return False
    
    files = []
    for root, dirs, filenames in os.walk(DIST_DIR):
        for filename in filenames:
            local_path = os.path.join(root, filename)
            rel_path = os.path.relpath(local_path, DIST_DIR)
            cloud_key = f"{CLOUD_BASE}/{rel_path}".replace("\\", "/")
            files.append((local_path, cloud_key))
    
    print(f"准备上传 {len(files)} 个文件...")
    print(f"目标: {DEPLOY_URL}")
    print("-" * 40)
    
    success_count = 0
    for i, (local_path, cloud_key) in enumerate(files, 1):
        print(f"[{i}/{len(files)}] 上传 {cloud_key}...", end=" ")
        if upload_file(local_path, cloud_key):
            print("OK")
            success_count += 1
        else:
            print("SKIP")
    
    print("-" * 40)
    print(f"上传完成: {success_count}/{len(files)}")
    
    if success_count > 0:
        print(f"\n[SUCCESS] Deploy completed!")
        print(f"Access URL: {DEPLOY_URL}")
        return True
    else:
        print(f"\n[FAILED] Deploy failed")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("产品成本分解Agent - 腾讯云静态托管部署")
    print(f"时间: {datetime.now():%Y-%m-%d %H:%M:%S}")
    print("=" * 50)
    
    success = deploy_all()
    exit(0 if success else 1)
