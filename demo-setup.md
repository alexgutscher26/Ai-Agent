# FlowPilot Demo Setup

This guide shows how to set up and test the FlowPilot extension without needing an API key.

## Quick Setup

1. **Install the Extension** (when available in marketplace)
   - Or load from source: Press `F5` in VS Code with this project open

2. **Enable Demo Mode**
   - Open VS Code Settings (`Ctrl+,` or `Cmd+,`)
   - Search for "FlowPilot"
   - Check the box for "Demo Mode" (`codeCoach.demoMode`)

3. **Open FlowPilot Sidebar**
   - Look for the 🎓 (graduation cap) icon in the Activity Bar (left sidebar)
   - Click it to open the FlowPilot panel

4. **Test the Extension**
   - Create a new Python file (`.py` extension)
   - Write some Python code
   - Try the features below

## Demo Features

### 1. Code Explanation
```python
def calculate_area(radius):
    pi = 3.14159
    area = pi * radius * radius
    return area

result = calculate_area(5)
print(f"Area: {result}")
```

**To test:**
1. Select the code above
2. Right-click → "FlowPilot: Explain Selected Code"
3. View the explanation in the FlowPilot sidebar panel

### 2. Code Review
```python
# This code could be improved
numbers = [1, 2, 3, 4, 5]
total = 0
for i in range(len(numbers)):
    total = total + numbers[i]
print(total)
```

**To test:**
1. Select the code above
2. Command Palette (`Ctrl+Shift+P`) → "FlowPilot: Review Selected Code"
3. See suggestions for improvements

### 3. Error Explanation
```python
# This code has an intentional error
def greet(name):
    print(f"Hello, {name}!")

greet()  # Missing required argument
```

**To test:**
1. Copy the code above into a Python file
2. Notice the error underline
3. Click the lightbulb icon or use Command Palette → "FlowPilot: Explain This Error"
4. Learn about the error and how to fix it

## Demo Mode Features

When demo mode is enabled:
- ✅ Realistic explanations tailored to your skill level
- ✅ Code reviews with actual suggestions
- ✅ Error explanations with helpful guidance
- ✅ No API key required
- ✅ Works offline
- ✅ Simulated API delays for realistic experience

## Switching to Production

When you're ready to use the real FlowPilot service:
1. Get an API key from [FlowPilot Dashboard](https://dashboard.codecoach.dev)
2. Disable Demo Mode (`codeCoach.demoMode: false`)
3. Set your API key (`codeCoach.apiKey`)
4. Enjoy enhanced explanations powered by the full AI service!

## Troubleshooting

**Extension not working?**
- Make sure you're in a Python file (`.py` extension)
- Check that Demo Mode is enabled in settings
- Ensure the FlowPilot sidebar is open (🎓 icon in Activity Bar)
- Try reloading VS Code (`Ctrl+Shift+P` → "Developer: Reload Window")

**No explanations showing?**
- Ensure the FlowPilot sidebar panel is visible (🎓 icon in Activity Bar)
- Check the VS Code Developer Console for errors (`Help` → `Toggle Developer Tools`)

**Sidebar not loading?**
- Look for the 🎓 (graduation cap) icon in the Activity Bar (left side of VS Code)
- If missing, try reloading the window or reinstalling the extension
- Check that the extension is properly activated for Python files

**Want to see the mock responses?**
- Open VS Code Developer Console
- Look for `[Demo Mode]` log messages showing the mock API calls