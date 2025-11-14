# Deployment Guide - PROJECT TOM

## Quick Deploy to Vercel

### Option 1: Vercel Dashboard (Recommended)

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select `MEDASKCA/PROJECTTOM` from GitHub
4. Configure the following environment variables:

**Firebase:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=medaskca-93d48.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=medaskca-93d48
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=medaskca-93d48.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Azure OpenAI:**
```
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://medaskca-openai.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
```

**Azure Speech (Optional):**
```
AZURE_SPEECH_API_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=uksouth
```

**EPR System:**
```
NEXT_PUBLIC_EPR_SYSTEM=manual
```

5. Click "Deploy"
6. Wait 2-3 minutes for build to complete
7. Access your live PROJECT TOM at the provided URL

### Option 2: Vercel CLI

```bash
# Login to Vercel
npx vercel login

# Deploy from project directory
cd project-tom
npx vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? MEDASKCA (or your account)
# - Link to existing project? No
# - What's your project's name? project-tom
# - In which directory is your code located? ./
# - Auto-detected settings? Yes

# For production deployment:
npx vercel --prod
```

### Option 3: GitHub Integration (Auto-deploy)

1. Connect Vercel to your GitHub account
2. Import the MEDASKCA/PROJECTTOM repository
3. Every push to `main` branch will auto-deploy

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | `medaskca-93d48` |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | `your_key_here...` |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint | `https://medaskca-openai.openai.azure.com/` |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | GPT-4o deployment name | `gpt-4o` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AZURE_SPEECH_API_KEY` | Azure TTS API key | Browser TTS fallback |
| `AZURE_SPEECH_REGION` | Azure region | `uksouth` |
| `NEXT_PUBLIC_EPR_SYSTEM` | EPR system type | `manual` |

## Post-Deployment Checklist

- [ ] Verify deployment URL is accessible
- [ ] Test chat interface loads correctly
- [ ] Test voice input (microphone icon)
- [ ] Test voice output (speaking)
- [ ] Check Firebase connection (query theatre data)
- [ ] Verify Azure OpenAI responses
- [ ] Test on mobile devices
- [ ] Check browser console for errors
- [ ] Review Vercel deployment logs

## Troubleshooting

### Build Errors

If the build fails:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Ensure no secrets in code (use .env only)
4. Run `npm run build` locally to reproduce

### Firebase Connection Issues

If Firebase isn't connecting:
1. Verify Firebase credentials in environment variables
2. Check Firebase project ID is `medaskca-93d48`
3. Ensure Firestore database is active
4. Verify Firebase rules allow reads

### Azure OpenAI Errors

If AI isn't responding:
1. Verify Azure OpenAI API key is correct
2. Check deployment name is `gpt-4o`
3. Ensure endpoint URL is correct
4. Check Azure OpenAI quotas and limits

### Voice Issues

If voice isn't working:
- **Microphone**: Check browser permissions for microphone access
- **TTS**: If Azure Speech not configured, browser TTS will be used automatically
- **Browser support**: Chrome/Edge recommended for best voice experience

## Monitoring

### Vercel Analytics

Enable Vercel Analytics to track:
- Page views
- Performance metrics
- Core Web Vitals
- User engagement

### Firebase Analytics

Consider adding Firebase Analytics for:
- User interactions
- Query patterns
- Feature usage
- Error tracking

## Security Checklist

- [x] Secrets stored in environment variables (not in code)
- [x] .env files in .gitignore
- [x] Firebase security rules configured
- [x] HTTPS enforced (automatic on Vercel)
- [x] NHS DTAC audit logging enabled
- [ ] Set up Azure AD authentication (optional)
- [ ] Configure IP allowlisting (if needed)
- [ ] Enable Vercel authentication (if needed)

## Performance Optimization

After deployment:
1. Enable Vercel Edge Network for global CDN
2. Configure ISR (Incremental Static Regeneration) if needed
3. Monitor API response times
4. Set up caching for database queries
5. Enable Vercel Speed Insights

## Custom Domain (Optional)

To use a custom domain:
1. Go to Vercel Project Settings → Domains
2. Add your domain (e.g., tom.medaskca.com)
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning
5. Access PROJECT TOM at your custom domain

## Support

For deployment issues:
- **Vercel**: https://vercel.com/support
- **Firebase**: https://firebase.google.com/support
- **Azure**: https://azure.microsoft.com/support
- **PROJECT TOM**: https://github.com/MEDASKCA/PROJECTTOM/issues

---

**🏥 Deployed with care by MEDASKCA**
