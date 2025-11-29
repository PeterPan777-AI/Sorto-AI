#!/usr/bin/env python3
"""
Document Organizer Desktop Launcher
Launches the web server and opens the browser
"""

import os
import sys
import time
import subprocess
import webbrowser
import socket
from pathlib import Path
import threading

# Configuration
APP_NAME = "Document Organizer"
SERVER_PORT = 3000
SERVER_HOST = "localhost"
BASE_DIR = Path(__file__).parent.parent


def find_free_port(start_port=3000, max_attempts=10):
    """Find a free port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind(('localhost', port))
            sock.close()
            return port
        except OSError:
            continue
    return None


def is_server_running(host, port):
    """Check if server is running on given host:port"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except:
        return False


def start_server():
    """Start the Node.js server"""
    print(f"Starting {APP_NAME} server...")
    
    # Change to project directory
    os.chdir(BASE_DIR)
    
    # Set environment variables
    env = os.environ.copy()
    env['NODE_ENV'] = 'production'
    env['PORT'] = str(SERVER_PORT)
    
    # Start the server
    if sys.platform == 'win32':
        # Windows
        cmd = ['node', 'server/_core/index.js']
        creationflags = subprocess.CREATE_NO_WINDOW
    else:
        # Unix-like
        cmd = ['node', 'server/_core/index.js']
        creationflags = 0
    
    try:
        process = subprocess.Popen(
            cmd,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=creationflags if sys.platform == 'win32' else 0
        )
        
        # Wait for server to start
        max_wait = 30  # seconds
        start_time = time.time()
        
        while time.time() - start_time < max_wait:
            if is_server_running(SERVER_HOST, SERVER_PORT):
                print(f"Server started successfully on http://{SERVER_HOST}:{SERVER_PORT}")
                return process
            time.sleep(0.5)
        
        print("Server failed to start within timeout period")
        return None
        
    except Exception as e:
        print(f"Error starting server: {e}")
        return None


def open_browser():
    """Open the application in default browser"""
    url = f"http://{SERVER_HOST}:{SERVER_PORT}"
    print(f"Opening browser at {url}")
    
    # Wait a bit for server to be fully ready
    time.sleep(2)
    
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"Error opening browser: {e}")
        print(f"Please open your browser manually and navigate to: {url}")


def show_system_tray_icon():
    """Show system tray icon (Windows only)"""
    # TODO: Implement system tray icon using pystray or similar
    pass


def main():
    """Main entry point"""
    print(f"=== {APP_NAME} ===")
    print(f"Version 1.0.0")
    print()
    
    # Check if server is already running
    if is_server_running(SERVER_HOST, SERVER_PORT):
        print(f"Server is already running on port {SERVER_PORT}")
        print("Opening browser...")
        open_browser()
        return
    
    # Find a free port if default is taken
    port = find_free_port(SERVER_PORT)
    if port and port != SERVER_PORT:
        print(f"Port {SERVER_PORT} is taken, using port {port} instead")
        global SERVER_PORT
        SERVER_PORT = port
    
    # Start the server
    server_process = start_server()
    
    if server_process is None:
        print("Failed to start server. Exiting.")
        input("Press Enter to exit...")
        sys.exit(1)
    
    # Open browser
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    print()
    print(f"{APP_NAME} is now running!")
    print(f"Access at: http://{SERVER_HOST}:{SERVER_PORT}")
    print()
    print("Press Ctrl+C to stop the server and exit")
    print()
    
    try:
        # Keep the process running
        server_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server_process.terminate()
        try:
            server_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server_process.kill()
        print("Server stopped.")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Fatal error: {e}")
        input("Press Enter to exit...")
        sys.exit(1)
