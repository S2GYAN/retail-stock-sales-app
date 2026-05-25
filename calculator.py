print("--- Simple Python Calculator ---")

# 1. Get the numbers from the user
num1 = float(input("Enter your first number: "))
num2 = float(input("Enter your second number: "))

# 2. Let the user choose an operation
print("\nChoose an operation:")
print("+ for Addition")
print("- for Subtraction")
print("* for Multiplication")
print("/ for Division")
operation = input("Enter your choice (+, -, *, /): ")

# 3. Calculate and display the result
if operation == "+":
    result = num1 + num2
    print(f"Result: {num1} + {num2} = {result}")
elif operation == "-":
    result = num1 - num2
    print(f"Result: {num1} - {num2} = {result}")
elif operation == "*":
    result = num1 * num2
    print(f"Result: {num1} * {num2} = {result}")
elif operation == "/":
    # A quick check to prevent crashing if someone divides by zero
    if num2 != 0:
        result = num1 / num2
        print(f"Result: {num1} / {num2} = {result}")
    else:
        print("Error: You can't divide by zero!")
else:
    print("Invalid operator selected.")
