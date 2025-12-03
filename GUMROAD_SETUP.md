# Setting Up Gumroad for Sorto License Sales

This guide will help you set up Gumroad to sell Sorto licenses and automatically deliver license keys to customers.

## Step 1: Create a Gumroad Account

1. Go to [gumroad.com](https://gumroad.com)
2. Click **Sign up** and create your account
3. Complete your profile (name, bio, avatar)
4. Add payment details (bank account or PayPal) to receive payments

## Step 2: Create Your Product

1. Click **+ New Product** in your Gumroad dashboard
2. Choose **Digital Product**
3. Fill in product details:

### Product Information
- **Name**: Sorto - AI Document Organizer
- **URL**: `gumroad.com/l/sorto` (or your custom domain)
- **Price**: Choose your pricing model:
  - **One-time**: $99 (lifetime license)
  - **Subscription**: $9.99/month or $99/year
- **Description**: Copy from your landing page or use:
  ```
  Sorto is an AI-powered document organizer that automatically tags, searches, and finds duplicates in your document library. Privacy-first - all processing happens locally on your computer.
  
  Features:
  - AI-powered automatic tagging
  - Smart full-text search
  - Duplicate detection (exact, versions, similar)
  - Privacy-first (documents never leave your computer)
  - Fast scanning (thousands of documents in minutes)
  
  System Requirements:
  - Windows 10 or 11 (64-bit)
  - 4GB RAM minimum
  - 500MB free disk space
  ```

### Product Files
- Upload `Sorto Setup 1.0.0.exe` (your installer)
- Or link to your GitHub Releases page

### Product Image
- Upload your Sorto logo (the infinity symbol)
- Add screenshots of the app in action

## Step 3: Enable License Keys

This is the most important step!

1. In your product settings, scroll to **License Keys**
2. Toggle **Enable license key generation**
3. Choose **Generate a unique license key for each purchase**
4. **License key format**: Use the default (XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX)
5. **Save** your settings

## Step 4: Get Your Product Permalink

1. After creating the product, note your **product permalink**
2. It will be something like: `sorto` or `your-username/sorto`
3. The full URL will be: `https://gumroad.com/l/sorto`

## Step 5: Configure Sorto with Your Product

You need to set the product permalink in your Sorto code:

1. Open `.env` file in your project (or create it if it doesn't exist)
2. Add this line:
   ```
   GUMROAD_PRODUCT_PERMALINK=sorto
   ```
   Replace `sorto` with your actual product permalink

3. Rebuild the app:
   ```powershell
   pnpm build
   pnpm electron:build:win
   ```

## Step 6: Test the License System

Before going live, test everything:

### Generate a Test License Key
1. In Gumroad dashboard → Your Product → License Keys
2. Click **Generate test license key**
3. Copy the key (format: XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX)

### Test in Sorto
1. Install Sorto
2. When the license dialog appears, paste your test key
3. Click **Activate License**
4. Verify it shows "License Active"

## Step 7: Update Your Landing Page

Update the "Start Free 7-Day Trial" buttons to link to your Gumroad product:

```html
<a href="https://gumroad.com/l/sorto">Start Free 7-Day Trial</a>
```

Or use Gumroad's overlay:
```html
<script src="https://gumroad.com/js/gumroad.js"></script>
<a class="gumroad-button" href="https://gumroad.com/l/sorto">Buy Sorto</a>
```

## Step 8: Set Up Email Delivery

Gumroad automatically sends license keys to customers, but you can customize the email:

1. Product Settings → **Email to buyer**
2. Customize the message:
   ```
   Thanks for purchasing Sorto! 🎉
   
   Your license key is: {license_key}
   
   To activate:
   1. Download and install Sorto from: [your download link]
   2. Open Sorto
   3. When prompted, enter your license key
   4. Start organizing your documents!
   
   Need help? Email support@sorto.com
   
   - The Sorto Team
   ```

## Step 9: Go Live!

1. **Publish your product** on Gumroad
2. **Share the link** on your landing page, social media, etc.
3. **Test a real purchase** (you can refund yourself)
4. **Monitor sales** in your Gumroad dashboard

## Pricing Recommendations

### One-Time Purchase
- **$49**: Budget-friendly, good for individual users
- **$99**: Standard price for productivity tools
- **$149**: Premium positioning

### Subscription
- **$4.99/month**: Entry-level
- **$9.99/month**: Standard (most popular)
- **$19.99/month**: Professional

### Annual Discount
- Offer 17-20% discount for annual plans
- Example: $9.99/month or $99/year (save $20)

## Advanced: Gumroad API (Optional)

If you want to verify licenses in real-time (already implemented in Sorto):

1. Get your Gumroad API key:
   - Settings → Advanced → Application
   - Create new application
   - Copy the access token

2. Add to `.env`:
   ```
   GUMROAD_API_KEY=your_api_key_here
   ```

3. Sorto will now verify licenses with Gumroad's API

## Troubleshooting

### License key not working
- Check that license keys are enabled in product settings
- Verify the product permalink matches in your `.env` file
- Make sure the license wasn't refunded or disputed

### Customer didn't receive license key
- Check Gumroad's email logs (Product → Sales → Click on sale)
- Resend the email manually
- Or generate a new key and send it directly

### Want to revoke a license
- Go to Product → License Keys
- Find the key and click **Disable**
- Customer will see "Invalid license key" on next validation

## Next Steps

After Gumroad is set up:

1. **Add analytics** - Track how many people convert from trial to paid
2. **Set up affiliates** - Let others promote Sorto for a commission
3. **Create bundles** - Offer Sorto + other products together
4. **Run promotions** - Limited-time discounts to boost sales

## Support

- **Gumroad Help**: [help.gumroad.com](https://help.gumroad.com)
- **Gumroad Discord**: Great community for sellers
- **Email**: creators@gumroad.com

---

Good luck with your launch! 🚀
