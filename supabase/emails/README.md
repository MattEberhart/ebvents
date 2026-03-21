# Supabase Auth Email Templates

All templates use `{{ .Token }}` (OTP code) instead of `{{ .ConfirmationURL }}` (magic link).

## Supabase Dashboard Setup

### 1. Enable OTP/Code flow

**Authentication > Email > Email OTP (One-Time Password)**

In Supabase Dashboard under **Authentication > Providers > Email**, ensure:
- **Confirm email** is ON
- **Secure email change** is ON
- **Email OTP Length** is set to `6`
- **Email OTP Expiry** is set to desired value (3600 seconds = 1 hour recommended)

### 2. Paste templates

Go to **Authentication > Email Templates** and paste each file's HTML:

| Supabase Template Name | File                   | Subject Line                              |
| ---------------------- | ---------------------- | ----------------------------------------- |
| Confirm signup         | `confirm_signup.html`  | Your Ebvents verification code            |
| Magic Link             | `magic_link.html`      | Your Ebvents login code                   |
| Change Email Address   | `change_email.html`    | Confirm your Ebvents email change         |
| Reset Password         | `reset_password.html`  | Your Ebvents password reset code          |
| Invite User            | `invite_user.html`     | You've been invited to Ebvents            |

### Template variables

- `{{ .Token }}` — 8-digit OTP code (used in all templates)
- `{{ .ConfirmationURL }}` — NOT used (we use code flow, not link flow)
- `{{ .SiteURL }}` — Available but not used in current templates
