import subprocess
from typing import List, Tuple
from app.models.models import ManualApp
from app.core.config import settings

class NginxProxyManager:
    def __init__(self, config_path: str = None):
        self.config_path = config_path or settings.NGINX_CONFIG_PATH
    
    def generate_proxy_config(self, manual_apps: List[ManualApp]) -> str:
        """Generate nginx reverse proxy configuration"""
        
        config = """# Aircraft Manuals Proxy Configuration
# Auto-generated - DO NOT EDIT MANUALLY

server {
    listen 80;
    server_name _;
    
    client_max_body_size 100M;
    
    # Frontend React App
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
"""
        
        # Generate proxy locations for each manual app
        for app in manual_apps:
            if not app.is_active:
                continue
            
            location = app.url_path
            backend = f"http://{app.backend_host}:{app.backend_port}"
            
            config += f"""    # {app.title}
    location {location} {{
        proxy_pass {backend};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }}
    
"""
        
        config += "}\n"
        return config
    
    def write_config(self, config_content: str) -> None:
        """Write nginx configuration file"""
        try:
            with open(self.config_path, 'w') as f:
                f.write(config_content)
        except Exception as e:
            raise Exception(f"Failed to write config: {str(e)}")
    
    def test_config(self) -> Tuple[bool, str]:
        """Test nginx configuration"""
        try:
            result = subprocess.run(
                ['nginx', '-t'],
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.returncode == 0, result.stderr
        except subprocess.TimeoutExpired:
            return False, "Nginx test timed out"
        except FileNotFoundError:
            return False, "Nginx command not found"
        except Exception as e:
            return False, str(e)
    
    def reload_nginx(self) -> Tuple[bool, str]:
        """Reload nginx to apply changes"""
        try:
            result = subprocess.run(
                ['nginx', '-s', 'reload'],
                capture_output=True,
                text=True,
                timeout=10
            )
            return result.returncode == 0, result.stderr if result.stderr else "Reloaded successfully"
        except subprocess.TimeoutExpired:
            return False, "Nginx reload timed out"
        except FileNotFoundError:
            return False, "Nginx command not found"
        except Exception as e:
            return False, str(e)
    
    def update_nginx(self, manual_apps: List[ManualApp]) -> Tuple[bool, str]:
        """Full update: generate, test, and reload"""
        try:
            # Generate config
            config = self.generate_proxy_config(manual_apps)
            self.write_config(config)
            
            # Test config
            success, error = self.test_config()
            if not success:
                return False, f"Nginx config test failed: {error}"
            
            # Reload nginx
            success, message = self.reload_nginx()
            if success:
                return True, "Nginx configuration updated and reloaded successfully"
            else:
                return False, f"Nginx config valid but reload failed: {message}"
        except Exception as e:
            return False, f"Error updating nginx: {str(e)}"

nginx_manager = NginxProxyManager()
