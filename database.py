#!/usr/bin/env python3
import os
import sys
import json
import sqlite3
import hashlib

# Determine db path. Use /tmp on Vercel/serverless environments for write-access
if os.environ.get("VERCEL") or os.environ.get("PORT"):
    DB_PATH = "/tmp/taskforge_users.db"
else:
    DB_PATH = os.path.join(os.getcwd(), "taskforge_users.db")

def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

# 10 Predefined Users for Seed Data
PREDEFINED_USERS = [
    {
        "id": "usr-admin",
        "name": "Sarika Salunke",
        "email": "sarika@taskforge.com",
        "aliases": "sarika,sarika@taskforge.com,admin,sarika salunke,sarikasalunke",
        "password_hash": hash_password("admin"),
        "role": "Admin",
        "phone": "+91 98200 12345",
        "department": "Engineering",
        "bio": "Head of Engineering at TaskForge. Enjoys building highly scalable architectures and designing beautiful developer experiences.",
        "skills": "TypeScript,Next.js,System Design,Kubernetes,AI/ML",
        "joined_date": "2025-01-10",
        "last_active": "Just now",
        "avatar": ""
    },
    {
        "id": "usr-pm",
        "name": "Rahul Sharma",
        "email": "rahul@taskforge.com",
        "aliases": "rahul,rahul@taskforge.com,pm,rahul sharma,rahulsharma",
        "password_hash": hash_password("pm"),
        "role": "Project Manager",
        "phone": "+91 98300 54321",
        "department": "Product Management",
        "bio": "Lead Product Manager. Passionate about product-led growth, data analytics, and Linear-like hotkey efficiency.",
        "skills": "Product Strategy,Agile,User Research,Metrics,Figma",
        "joined_date": "2025-03-15",
        "last_active": "5m ago",
        "avatar": ""
    },
    {
        "id": "usr-liam",
        "name": "Abdul Khan",
        "email": "abdul@taskforge.com",
        "aliases": "abdul,abdul@taskforge.com,user,developer,abdul khan,abdulkhan",
        "password_hash": hash_password("user"),
        "role": "Team Member",
        "phone": "+91 98100 98765",
        "department": "Engineering",
        "bio": "Senior Full Stack Engineer. Specializes in building elegant, low-latency React components and complex data visualization dashboards.",
        "skills": "React,Node.js,D3.js,Tailwind CSS,GraphQL",
        "joined_date": "2025-04-01",
        "last_active": "15m ago",
        "avatar": ""
    },
    {
        "id": "usr-sophia",
        "name": "Inspector Daya",
        "email": "daya@taskforge.com",
        "aliases": "daya,daya@taskforge.com,designer,inspector daya,inspectordaya",
        "password_hash": hash_password("user"),
        "role": "Team Member",
        "phone": "+91 98400 67890",
        "department": "Design System",
        "bio": "Lead UI/UX Designer. Focused on minimalist interfaces, micro-animations, and typographic hierarchy.",
        "skills": "UI/UX Design,Figma,Design Systems,Framer Motion,Tailwind CSS",
        "joined_date": "2025-02-18",
        "last_active": "1h ago",
        "avatar": ""
    },
    {
        "id": "usr-ethan",
        "name": "Dr. Salunke",
        "email": "salunke@taskforge.com",
        "aliases": "salunke,salunke@taskforge.com,devops,qa,dr. salunke,dr salunke,drsalunke",
        "password_hash": hash_password("user"),
        "role": "Team Member",
        "phone": "+91 98900 11223",
        "department": "Engineering",
        "bio": "DevOps & Backend Specialist. Enjoys debugging memory leaks, optimizing database queries, and automating workflows.",
        "skills": "Node.js,Express,Docker,PostgreSQL,Redis",
        "joined_date": "2025-05-12",
        "last_active": "2d ago",
        "avatar": ""
    },
    {
        "id": "usr-neha",
        "name": "Neha Gupta",
        "email": "neha@taskforge.com",
        "aliases": "neha,neha@taskforge.com,neha gupta,nehagupta",
        "password_hash": hash_password("pm"),
        "role": "Project Manager",
        "phone": "+91 98765 43210",
        "department": "Product Operations",
        "bio": "Senior Product Operations Manager. Streamlining cross-functional alignment and technical milestones delivery.",
        "skills": "Operations,Roadmapping,Agile Frameworks,Jira,Communication",
        "joined_date": "2025-02-05",
        "last_active": "1d ago",
        "avatar": ""
    },
    {
        "id": "usr-vikram",
        "name": "Vikram Aditya",
        "email": "vikram@taskforge.com",
        "aliases": "vikram,vikram@taskforge.com,director,vikram aditya,vikramaditya",
        "password_hash": hash_password("admin"),
        "role": "Admin",
        "phone": "+91 99112 23344",
        "department": "Leadership",
        "bio": "Executive Director and Product Strategy Architect. Scaling development engines and driving company culture.",
        "skills": "Strategy,Leadership,Venture,Enterprise Growth,Mentorship",
        "joined_date": "2024-11-01",
        "last_active": "Just now",
        "avatar": ""
    },
    {
        "id": "usr-priya",
        "name": "Priya Nair",
        "email": "priya@taskforge.com",
        "aliases": "priya,priya@taskforge.com,designer2,priya nair,priyanair",
        "password_hash": hash_password("user"),
        "role": "Team Member",
        "phone": "+91 98555 44332",
        "department": "Design System",
        "bio": "Visual designer crafting beautiful iconographies, dark modes, and illustrations for product-driven assets.",
        "skills": "Illustrator,Figma,Branding,Typography,Prototyping",
        "joined_date": "2025-05-20",
        "last_active": "10m ago",
        "avatar": ""
    },
    {
        "id": "usr-rohan",
        "name": "Rohan Mehta",
        "email": "rohan@taskforge.com",
        "aliases": "rohan,rohan@taskforge.com,frontend,rohan mehta,rohanmehta",
        "password_hash": hash_password("user"),
        "role": "Team Member",
        "phone": "+91 98666 55443",
        "department": "Engineering",
        "bio": "Frontend developer specializing in high performance React canvas interactions, custom charts, and D3 analytics modules.",
        "skills": "React,D3,Canvas,HTML5 Canvas,TypeScript,Tailwind",
        "joined_date": "2025-06-02",
        "last_active": "3h ago",
        "avatar": ""
    },
    {
        "id": "usr-ananya",
        "name": "Ananya Sen",
        "email": "ananya@taskforge.com",
        "aliases": "ananya,ananya@taskforge.com,content,ananya sen,ananyasen",
        "password_hash": hash_password("user"),
        "role": "Team Member",
        "phone": "+91 98777 66554",
        "department": "Marketing & Content",
        "bio": "Content Strategist & Copywriter. Crafting beautiful product release notes and managing user onboarding flows.",
        "skills": "Copywriting,SEO,User Experience,Technical Writing,Analytics",
        "joined_date": "2025-06-15",
        "last_active": "4d ago",
        "avatar": ""
    }
]

def init_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            aliases TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            phone TEXT,
            department TEXT,
            bio TEXT,
            skills TEXT,
            joined_date TEXT,
            last_active TEXT,
            avatar TEXT
        )
        """)
        conn.commit()

        # Seed if empty
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            for u in PREDEFINED_USERS:
                cursor.execute("""
                INSERT INTO users (id, name, email, aliases, password_hash, role, phone, department, bio, skills, joined_date, last_active, avatar)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    u["id"], u["name"], u["email"], u["aliases"], u["password_hash"], u["role"],
                    u.get("phone"), u.get("department"), u.get("bio"), u.get("skills"), u.get("joined_date"), u.get("last_active"), u.get("avatar")
                ))
            conn.commit()
        conn.close()
        return True
    except Exception as e:
        sys.stderr.write(f"SQLite initialization failed: {str(e)}\n")
        return False

def format_user_row(row):
    return {
        "id": row[0],
        "name": row[1],
        "email": row[2],
        "phone": row[6],
        "department": row[7],
        "role": row[5],
        "bio": row[8],
        "skills": [s.strip() for s in row[9].split(",") if s.strip()] if row[9] else [],
        "joinedDate": row[10],
        "lastActive": row[11],
        "avatar": row[12]
    }

def login(identifier, password):
    init_db()
    sanitized_id = identifier.strip().lower()
    hashed_p = hash_password(password.strip())

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users")
        rows = cursor.fetchall()
        conn.close()

        for row in rows:
            aliases_list = [a.strip().lower() for a in row[3].split(",") if a.strip()]
            if sanitized_id in aliases_list and row[4] == hashed_p:
                return {"success": True, "user": format_user_row(row)}
        
        return {"success": False, "error": "Invalid identifier or key."}
    except Exception as e:
        return {"success": False, "error": f"Database error: {str(e)}"}

def get_user(user_id):
    init_db()
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()

        if row:
            return {"success": True, "user": format_user_row(row)}
        return {"success": False, "error": "User not found."}
    except Exception as e:
        return {"success": False, "error": f"Database error: {str(e)}"}

def list_users():
    init_db()
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users")
        rows = cursor.fetchall()
        conn.close()

        users_list = [format_user_row(row) for row in rows]
        return {"success": True, "users": users_list}
    except Exception as e:
        return {"success": False, "error": f"Database error: {str(e)}"}

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Missing action argument"}))
        return

    action = sys.argv[1]

    if action == "--init":
        success = init_db()
        print(json.dumps({"success": success}))
    elif action == "--login":
        if len(sys.argv) < 4:
            print(json.dumps({"success": False, "error": "Missing login arguments"}))
            return
        identifier = sys.argv[2]
        password = sys.argv[3]
        print(json.dumps(login(identifier, password)))
    elif action == "--get-user":
        if len(sys.argv) < 3:
            print(json.dumps({"success": False, "error": "Missing user ID"}))
            return
        user_id = sys.argv[2]
        print(json.dumps(get_user(user_id)))
    elif action == "--list-users":
        print(json.dumps(list_users()))
    else:
        print(json.dumps({"success": False, "error": f"Unknown action: {action}"}))

if __name__ == "__main__":
    main()
