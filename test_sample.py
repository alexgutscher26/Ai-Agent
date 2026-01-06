# Sample Python code for testing FlowPilot extension

def calculate_fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# Test with various inputs
numbers = [0, 1, 5, 10]
for num in numbers:
    result = calculate_fibonacci(num)
    print(f"Fibonacci({num}) = {result}")   

# This will cause an error - undefined variable
print(undefined_variable)

# This will cause a syntax error if uncommented
# print("Missing closing quote

# filename: intentional_error.py

def divide(a, b):
    return a / b

result = divide(10, 0)
print("Result is:", result)
        
