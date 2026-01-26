# NAT Interpretation and Translation Services, LLC - Website

A clean, modern, responsive multi-page website for NAT Interpretation and Translation Services, LLC. Built with plain HTML, CSS, and minimal JavaScript for easy editing and maintenance.

## 📁 Project Structure

```
aminata interpretation/
├── index.html              # Home page
├── services.html          # Services page
├── team.html              # Meet Our Team page
├── contact.html           # Contact page with form
├── README.md              # This file
└── assets/
    ├── css/
    │   └── styles.css     # Main stylesheet
    ├── js/
    │   └── main.js        # JavaScript for mobile menu and navigation
    └── img/               # Image directory (for future use)
```

## 🚀 How to Run Locally

### Option 1: Direct File Opening (Simplest)
1. Simply double-click `index.html` in your file explorer
2. The website will open in your default browser
3. **Note:** Some features (like form submission) require a local server

### Option 2: Using a Local Server (Recommended)
For the best experience, especially for testing the contact form:

**Using Python (if installed):**
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then open `http://localhost:8000` in your browser.

**Using Node.js (if installed):**
```bash
# Install http-server globally (one time)
npm install -g http-server

# Run the server
http-server
```

**Using VS Code:**
1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## ✏️ How to Edit Content

### Editing Text Content
- **HTML Files:** Open any `.html` file in VS Code/Cursor and edit the text directly
- All content is in plain HTML, making it easy to find and modify
- Look for sections with comments like `<!-- Hero Section -->` to navigate quickly

### Editing Styles
- **CSS File:** Edit `assets/css/styles.css`
- The file is well-organized with comments marking each section
- Color variables are defined at the top in `:root` for easy theme customization

### Adding/Replacing Images
1. Place your images in the `assets/img/` folder
2. Update image references in HTML files:
   ```html
   <img src="assets/img/your-image.jpg" alt="Description">
   ```
3. For team member photos, replace the placeholder divs in `team.html`

### Changing Colors
Edit the CSS variables at the top of `assets/css/styles.css`:
```css
:root {
    --primary-color: #2563eb;      /* Main brand color */
    --primary-dark: #1e40af;       /* Darker shade for hover */
    --secondary-color: #0f172a;    /* Dark text color */
    --accent-color: #f59e0b;       /* Accent color */
    /* ... more variables */
}
```

## 📧 Setting Up the Contact Form

The contact form uses **Formspree** for email delivery. Here's how to set it up:

### Formspree Setup (Recommended - Free Tier Available)

1. **Create a Formspree Account:**
   - Go to [https://formspree.io/](https://formspree.io/)
   - Sign up for a free account (allows 50 submissions/month on free tier)

2. **Create a New Form:**
   - After logging in, click "New Form"
   - Give it a name (e.g., "NAT Contact Form")
   - Copy the form endpoint URL (looks like: `https://formspree.io/f/YOUR_FORM_ID`)

3. **Update the Contact Form:**
   - Open `contact.html` in your editor
   - Find the form tag (around line 60):
     ```html
     <form action="YOUR_FORMSPREE_ENDPOINT_HERE" method="POST" id="contact-form">
     ```
   - Replace `YOUR_FORMSPREE_ENDPOINT_HERE` with your actual Formspree endpoint
   - Find the hidden input field:
     ```html
     <input type="hidden" name="_replyto" value="example@domain.com">
     ```
   - Replace `example@domain.com` with your actual email address where you want to receive form submissions

4. **Test the Form:**
   - Submit a test message through the form
   - Check your email (and spam folder) for the submission
   - Formspree will send you an email confirmation on first use

### Alternative: Netlify Forms

If you're deploying to Netlify:

1. Add `netlify` attribute to the form tag:
   ```html
   <form action="/" method="POST" netlify>
   ```

2. Remove the Formspree action URL

3. Deploy to Netlify - forms will work automatically

4. Configure email notifications in Netlify dashboard

### Form Fields Included:
- Full Name (required)
- Email (required)
- Phone (optional)
- Service Needed (dropdown - required)
- Language Pair (text - required)
- Message (required)
- Preferred Date/Time (optional)

## 🎨 Customization Tips

### Changing Business Information
- **Business Name:** Search and replace "NAT Interpretation" throughout all HTML files
- **Phone Number:** Update in `contact.html` (appears in contact info section)
- **Email:** Update in `contact.html` and in the form's hidden field
- **Address/Service Area:** Update in `contact.html` and `index.html` (Service Areas section)

### Adding More Team Members
1. Open `team.html`
2. Find the team member grid section
3. Copy one of the existing team member card structures
4. Update the name, role, and bio
5. Add a photo by replacing the placeholder div with an `<img>` tag

### Adding More Services
1. Open `services.html`
2. Add new service items following the existing structure
3. Update navigation links if needed

## 🔧 Technical Details

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (tested on iOS and Android)
- No JavaScript required for basic functionality (progressive enhancement)

### Dependencies
- **Google Fonts:** Inter font family (loaded from CDN)
- **No build tools required:** Pure HTML/CSS/JS
- **No package managers:** No npm, yarn, or other dependencies

### SEO Features
- Semantic HTML5 structure
- Meta tags for description and keywords
- Open Graph tags for social media sharing
- Proper heading hierarchy (h1, h2, h3)

### Accessibility
- Semantic HTML elements
- ARIA labels on interactive elements
- Proper form labels
- Keyboard navigation support
- Mobile-friendly touch targets

## 💳 Payment Integration (Future)

**Note:** Payment integration is NOT implemented in this version. When ready to add payment processing:

### PayPal Integration (Recommended for Later)
1. Sign up for a PayPal Business account
2. Get your PayPal API credentials
3. Add PayPal buttons to the quote/contact flow
4. Consider using PayPal's hosted checkout for security

### Implementation Notes:
- Add payment buttons to the contact confirmation page
- Or create a separate "Payment" page
- Use PayPal's JavaScript SDK for seamless integration
- Ensure SSL certificate is installed (HTTPS required for payments)

## 📝 Content Notes

- All content is placeholder text specific to the interpretation/translation business
- Replace testimonials with real client feedback when available
- Update team member bios with actual information
- Add real photos to replace placeholder elements

## 🐛 Troubleshooting

### Form Not Sending Emails
- Verify Formspree endpoint is correct in `contact.html`
- Check Formspree dashboard for submission logs
- Ensure email address in `_replyto` field is valid
- Check spam folder for Formspree confirmation emails

### Styles Not Loading
- Verify `assets/css/styles.css` path is correct
- Check browser console for 404 errors
- Ensure file structure matches the project structure

### Mobile Menu Not Working
- Verify `assets/js/main.js` is loaded
- Check browser console for JavaScript errors
- Ensure JavaScript is enabled in browser

## 📞 Support

For questions about editing this website:
- All code is commented for clarity
- HTML structure is semantic and easy to navigate
- CSS uses clear class names and is organized by section

## 📄 License

This website template is created for NAT Interpretation and Translation Services, LLC.

---

**Last Updated:** January 2026
