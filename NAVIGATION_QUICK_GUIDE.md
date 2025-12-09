# Navigation Feature - Quick Guide

## 🎯 What's New?

You can now choose whether to include navigation in your HTML project exports!

---

## 📋 How to Use

### Creating a New Project

1. Click **"New Project"**
2. Fill in project details
3. Select **"HTML"** as framework
4. Choose style framework (CSS or Tailwind)
5. Look for **"Export Settings"** section
6. Check/uncheck **"Include Default Navigation"**
   - ✅ **Checked (Default):** Navigation included in export
   - ❌ **Unchecked:** No navigation, standalone frames

---

## 🎨 What You Get

### With Navigation Enabled ✅

**Export Structure:**
```
index.html          ← Navigation page
├── Nav buttons for each frame
└── Iframe loads frames

frames/
├── home.html
├── about.html
└── contact.html

Open index.html → Click buttons → Frames switch
```

**Perfect for:**
- Multi-page websites
- Prototypes with multiple screens
- Client presentations
- Easy frame navigation

---

### With Navigation Disabled ❌

**Export Structure:**
```
index.html          ← Welcome page only
└── "Open frames manually"

frames/
├── home.html       ← Open these directly
├── about.html
└── contact.html

Open frames/home.html directly
```

**Perfect for:**
- Single-page apps
- Landing pages
- Custom navigation
- Standalone components

---

## 💡 Quick Tips

### ✅ Enable Navigation If:
- You have multiple frames
- You want out-of-box navigation
- Creating a prototype/demo
- Need easy frame switching

### ❌ Disable Navigation If:
- You only have one frame
- You'll add custom navigation
- Each frame is independent
- Building a component library

---

## 🔄 Can I Change It Later?

**Currently:** Set at project creation only

**Workaround:** 
- Create new project with different setting
- Or manually edit exported files after download

**Future:** May add ability to change during export

---

## 📊 Visual Comparison

### With Navigation
```
┌─────────────────────────────────┐
│ [Home] [About] [Contact]        │ ← Navigation
├─────────────────────────────────┤
│                                 │
│   Frame content here (iframe)   │
│                                 │
│                                 │
└─────────────────────────────────┘
```

### Without Navigation
```
┌─────────────────────────────────┐
│                                 │
│   Welcome to Your Project       │
│                                 │
│   Open frames manually from     │
│   the frames/ folder            │
│                                 │
└─────────────────────────────────┘
```

---

## ❓ FAQ

**Q: Is this available for React projects?**
A: No, currently HTML projects only. React uses its own routing system.

**Q: What's the default setting?**
A: Navigation is **enabled by default** (checked).

**Q: Can I customize the navigation style?**
A: Not yet. Currently one navigation style. Custom styles coming in future updates.

**Q: Will existing projects have navigation?**
A: Yes, existing projects default to `include_navigation: true` for backward compatibility.

**Q: Does this affect GitHub export?**
A: Yes! The setting applies to both ZIP and GitHub exports.

---

## 🚀 Quick Start

### Test With Navigation (Default)
```bash
1. Create new HTML project
2. Leave "Include Default Navigation" checked
3. Add 2-3 frames
4. Export as ZIP
5. Open index.html
6. ✅ See navigation working!
```

### Test Without Navigation
```bash
1. Create new HTML project
2. UNCHECK "Include Default Navigation"
3. Add 1 frame
4. Export as ZIP
5. Open index.html → Welcome page
6. Open frames/frame.html → Direct frame
7. ✅ No navigation, as expected!
```

---

## 📝 Summary

| Setting | Navigation | Use Case |
|---------|-----------|----------|
| ✅ Enabled | Yes | Multi-frame projects |
| ❌ Disabled | No | Single-frame or custom |

**That's it!** Simple checkbox, powerful control. 🎉

---

## 🤝 Need Help?

- See `NAVIGATION_FEATURE_SUMMARY.md` for detailed docs
- Check `TESTING_GUIDE.md` for complete testing steps
- Review `EXPORT_FLOW_DIAGRAM.md` for architecture

**Happy building!** 🚀
