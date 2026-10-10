import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'instance', 'agency.db')

def migrate_booking():
    print(f"Connecting to {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    columns_to_add = [
        ("booking_number", "VARCHAR(50)"),
        ("discount", "FLOAT DEFAULT 0.0"),
        ("final_amount", "FLOAT"),
        ("payment_status", "VARCHAR(50) DEFAULT 'UNPAID'"),
        ("media_consent", "VARCHAR(50) DEFAULT 'PENDING'"),
        ("groom_name", "VARCHAR(150)"),
        ("bride_name", "VARCHAR(150)")
    ]

    for col_name, col_def in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE booking ADD COLUMN {col_name} {col_def}")
            print(f"Successfully added column {col_name}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column {col_name} already exists.")
            else:
                print(f"Error adding {col_name}: {e}")

    conn.commit()
    conn.close()
    print("Booking table migration complete.")

if __name__ == '__main__':
    migrate_booking()
