# create_account.py

users = {}

def create_account(name, email, password):
    if email in users:
        return "Error: Email already registered"

    if len(password) < 8 or not contains_number(password):
        return "Error: Weak password"

    hashed_password = hash_password(password)
    new_user = {"name": name, "email": email, "passwordHash": hashed_password}
    users[email] = new_user
    return "Account created successfully"

def contains_number(text):
    for char in text:
        if char.isdigit():
            return True
    return False

def hash_password(input_text):
    return "HASHED_" + input_text  # Simple fake hash for demo

def run_tests():
    print("Test 1:", create_account("Vicente", "vicente@example.com", "StrongPass1"))
    print("Test 2:", create_account("Vicente2", "vicente@example.com", "AnotherPass2"))
    print("Test 3:", create_account("Vicente3", "new@example.com", "123"))

if __name__ == "__main__":
    run_tests()
