from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import smtplib
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# CORS(app)  # This is fine for localhost
CORS(app, resources={r"/api/*": {"origins": "*"}})


# Gmail credentials
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")
RECEIVER_EMAIL = os.getenv("RECEIVER_EMAIL")

@app.route("/api/contact", methods=["POST"])
def contact():
    print("✅ Contact endpoint hit!")  # Debug log
    
    try:
        data = request.get_json()
        

        if not data:
            return jsonify({"error": "No data provided"}), 400

        name = data.get("name", "").strip()
        phone = data.get("phone", "").strip()
        message = data.get("message", "").strip()

        if not all([name, phone, message]):
            return jsonify({"error": "All fields are required"}), 400

        email_subject = f"New Contact Form Message from {name}"
        email_body = f"""
New message from Jayid Botamed Health Care website:

Name: {name}
Phone: {phone}

Message:
{message}
        """

        # Send email via Gmail SMTP
        print("📧 Attempting to send email...")
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        
        email_message = f"Subject: {email_subject}\n\n{email_body}"
        server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, email_message)
        server.quit()
        
        print("✅ Email sent successfully!")
        return jsonify({"message": "Message sent successfully!"}), 200

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/")
def home():
    return render_template("home.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)