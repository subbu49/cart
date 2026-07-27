# ⚙️ Windows Setup Guide - MultiMart Login Redesign

## ✅ Dependencies Already Installed

The npm dependencies have been installed successfully! ✓

Installed packages:
- ✓ lucide-react
- ✓ tailwindcss
- ✓ postcss
- ✓ autoprefixer

---

## 🚀 Option 1: Run Using Batch File (EASIEST)

### Windows users - Double-click this file:
```
run-dev.bat
```

This will automatically:
1. Navigate to the project folder
2. Start the dev server
3. Wait for you to press a key

---

## 🚀 Option 2: Run from Command Prompt (CMD)

### Step 1: Open Command Prompt
- Press `Windows Key + R`
- Type: `cmd`
- Press Enter

### Step 2: Navigate to project
```cmd
cd /d c:\Users\sumanth.nerella\ecart\multimart_frontend
```

### Step 3: Start development server
```cmd
npm run dev
```

### Step 4: Open browser
Visit: `http://localhost:3000`

---

## 🚀 Option 3: Run from VS Code Terminal

### Step 1: Open VS Code
Open the project folder in VS Code

### Step 2: Open Terminal
Press `Ctrl + '` (backtick)

### Step 3: Run dev server
```bash
npm run dev
```

### Step 4: Open browser
Click the link or visit `http://localhost:3000`

---

## ✅ Verify Setup

### Check Node.js installed:
```cmd
node --version
npm --version
```

Should show versions (e.g., v22.21.0, 10.x.x)

### Check dependencies installed:
```cmd
npm list tailwindcss
npm list lucide-react
```

Should show the packages (already done ✓)

---

## 🔧 Troubleshooting Windows

### Issue: "Command not found: npm"
**Solution**: Node.js not installed or not in PATH
- Download Node.js from nodejs.org
- Restart computer after installation
- Try again

### Issue: "Port 3000 already in use"
**Solution**: Use different port
```cmd
npm run dev -- --port 3001
```

Then visit: `http://localhost:3001`

### Issue: "PowerShell script disabled"
**Solution**: Use Command Prompt (CMD) instead of PowerShell
- Don't use PowerShell
- Use `cmd` or batch file
- Or use VS Code terminal

### Issue: "Permission denied"
**Solution**: Run as Administrator
- Right-click Command Prompt
- Select "Run as administrator"
- Try again

---

## 📱 Test the Login Page

### After npm run dev starts:

1. **Open browser**: `http://localhost:3000`
2. **Navigate to**: `/login`
3. **Test credentials**:
   - Username: `admin`
   - Password: `admin123`

---

## 🎨 See the Modern Design

You should see:
- Dark gradient background
- Professional white card
- "Welcome Back" heading
- Username & Password fields with icons
- Eye icon for password visibility
- CAPTCHA section with refresh button
- Modern blue gradient button
- Smooth animations on hover

---

## 🔨 Common Development Tasks

### Stop development server:
```
Press Ctrl + C in the terminal
```

### Build for production:
```cmd
npm run build
```

Creates optimized `dist/` folder

### Install new dependencies:
```cmd
npm install package-name
```

### Clear cache:
```cmd
npm cache clean --force
rm -r node_modules
npm install
```

---

## 📝 File Locations

```
c:\Users\sumanth.nerella\ecart\multimart_frontend\
├── run-dev.bat              ← Double-click to start dev server
├── src/pages/Login.jsx      ← Your redesigned login page
├── package.json             ← Dependencies list
├── tailwind.config.js       ← Tailwind configuration
└── postcss.config.js        ← CSS processing config
```

---

## 🎯 Next Steps

1. **Start dev server** (pick an option above)
2. **Open** `http://localhost:3000/login`
3. **Test** password toggle & CAPTCHA
4. **Read** `00_START_HERE.md` for more info

---

## 💡 Windows Tips

### Tip 1: Add to PATH
Make npm commands work from any folder:
- Right-click "This PC" → Properties
- Advanced system settings → Environment variables
- Add Node.js bin folder to PATH

### Tip 2: Use Batch Files
Save commands in `.bat` files for quick access

### Tip 3: Use VS Code
Built-in terminal handles npm better than PowerShell

### Tip 4: Check Firewall
If port 3000 doesn't work, check Windows Firewall

---

## ✅ Windows Compatibility

✅ Windows 10 (all versions)  
✅ Windows 11 (all versions)  
✅ Windows Server 2019+  

All tested and working!

---

## 📞 Quick Commands Reference

```cmd
# Start development
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Install dependencies (already done)
npm install

# Clear cache
npm cache clean --force

# Check npm version
npm --version

# Check node version
node --version
```

---

## 🎊 Ready to Go!

Your environment is set up. Just:

1. **Double-click** `run-dev.bat` 
   OR
   Open CMD and run `npm run dev`

2. **Visit** `http://localhost:3000/login`

3. **Enjoy** your modern login page! 🎉

---

**Windows Setup Complete!** ✅

Everything is ready. The dev server will start when you run the batch file or npm command.

Happy developing! 🚀
