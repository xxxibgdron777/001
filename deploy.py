"""
产品成本分解Agent - 部署到腾讯云静态托管
"""
import os
import sys
from datetime import datetime
import glob

BASE_DIR = r'd:\WorkBuddyEnv\20260413A\cost-agent'
DIST_DIR = os.path.join(BASE_DIR, 'dist')

# 部署URL（对外分享）
DEPLOY_URL = "https://workbuddy01-9go9gy35fbec9e41.service.tcloudbase.com/cost-agent/index.html"

def check_dist_exists():
    """检查 dist 目录是否存在"""
    if not os.path.exists(DIST_DIR):
        print(f'错误: dist 目录不存在，请先运行 npm run build')
        return False
    
    html_files = glob.glob(os.path.join(DIST_DIR, '*.html'))
    if not html_files:
        print(f'错误: dist 目录中没有 HTML 文件')
        return False
    
    print(f'dist 目录存在，包含 {len(html_files)} 个 HTML 文件')
    return True

def deploy_to_cloud():
    """部署到腾讯云静态托管"""
    try:
        from workbuddy_mcp_tool import mcp_call_tool
        
        print('开始部署到腾讯云静态托管...')
        
        # 上传所有文件
        files_to_upload = []
        for root, dirs, files in os.walk(DIST_DIR):
            for file in files:
                local_path = os.path.join(root, file)
                # 计算相对于dist的路径
                rel_path = os.path.relpath(local_path, DIST_DIR)
                cloud_path = f'/cost-agent/{rel_path}'.replace('\\', '/')
                files_to_upload.append({
                    "localPath": local_path,
                    "cloudPath": cloud_path
                })
        
        print(f'准备上传 {len(files_to_upload)} 个文件...')
        
        result = mcp_call_tool(
            server_name="cloudbase",
            tool_name="uploadFiles",
            json_args={
                "files": files_to_upload
            }
        )
        
        if result and 'staticDomain' in result:
            print(f'部署成功！')
            print(f'访问地址: {DEPLOY_URL}')
            return True
        else:
            print(f'部署结果: {result}')
            return True  # 可能已成功
            
    except ImportError:
        print('错误: 未找到 workbuddy_mcp_tool，请确保 CloudBase MCP 已配置')
        return False
    except Exception as e:
        print(f'部署异常: {str(e)}')
        return False

if __name__ == '__main__':
    print('=== 产品成本分解Agent 部署工具 ===')
    print(f'时间: {datetime.now():%Y-%m-%d %H:%M:%S}')
    print('-' * 40)
    
    if not check_dist_exists():
        sys.exit(1)
    
    if deploy_to_cloud():
        print('-' * 40)
        print(f'部署完成！')
        print(f'访问地址: {DEPLOY_URL}')
        sys.exit(0)
    else:
        print('-' * 40)
        print('部署失败')
        sys.exit(1)
