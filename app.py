from flask import Flask, render_template, request, redirect, url_for, flash
import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Change to your secret key

@app.route('/')
def home():
    return render_template("login.html")

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']

        try:
            conn = mysql.connector.connect(
                host=os.getenv("DB_HOST"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                database=os.getenv("DB_NAME")
            )
            cursor = conn.cursor()
            cursor.execute("INSERT INTO sign_up (name, email, apassword) VALUES (%s, %s, %s)", (name, email, password))
            conn.commit()
        except mysql.connector.Error as err:
            flash(f"Database error: {err}", "danger")
            return redirect(url_for('register'))
        finally:
            cursor.close()
            conn.close()

        flash("Registration successful! Please login.", "success")
        return redirect(url_for('home'))
    return render_template("register.html")

@app.route('/login', methods=['POST'])
def login():
    email = request.form['email']
    password = request.form['password']

    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME")
        )
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sign_in WHERE email = %s AND password = %s", (email, password))
        user = cursor.fetchone()
    except mysql.connector.Error as err:
        flash(f"Database error: {err}", "danger")
        return redirect(url_for('home'))
    finally:
        cursor.close()
        conn.close()

    if user:
        flash("Login successful!", "success")
    else:
        flash("Invalid email or password.", "danger")

    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)
