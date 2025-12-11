<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $type === 'register' ? 'Email Verification' : 'Login Verification' }}</title>
    <style>
        :root {
            --color-bg: #0a0a0f;
            --color-surface: #14141f;
            --color-border: #2a2a3a;
            --color-text: #e0e0f0;
            --color-text-muted: #a0a0b0;
            --color-primary: #6366f1;
            --color-primary-hover: #7c3aed;
            --color-accent: #22d3ee;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #0a0a0f 0%, #14141f 100%);
            color: var(--color-text);
            padding: 20px;
            line-height: 1.6;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        /* Header with animated gradient */
        .email-header {
            background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 50%, var(--color-accent) 100%);
            background-size: 200% 200%;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .logo-container {
            margin-bottom: 20px;
            position: relative;
            display: inline-block;
        }

        .logo {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            position: relative;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .logo::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%);
            border-radius: 50%;
            animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 0.8; }
        }

        .logo-text {
            font-size: 32px;
            font-weight: 800;
            color: white;
            position: relative;
            z-index: 1;
        }

        .email-header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }

        .email-header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
        }

        /* Content */
        .email-body {
            padding: 40px 30px;
        }

        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: var(--color-text);
            margin-bottom: 20px;
        }

        .message {
            color: var(--color-text-muted);
            font-size: 15px;
            margin-bottom: 30px;
            line-height: 1.8;
        }

        /* Verification Code Box */
        .code-container {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
            border: 2px solid var(--color-primary);
            border-radius: 16px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .code-container::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(99, 102, 241, 0.1), transparent);
            animation: shine 3s infinite;
        }

        @keyframes shine {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        .code-label {
            font-size: 14px;
            color: var(--color-text-muted);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            font-weight: 600;
        }

        .verification-code {
            font-size: 48px;
            font-weight: 800;
            color: var(--color-primary);
            letter-spacing: 12px;
            font-family: 'Courier New', monospace;
            text-align: center;
            position: relative;
            z-index: 1;
            text-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
        }

        .code-expiry {
            font-size: 13px;
            color: var(--color-text-muted);
            margin-top: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .timer-icon {
            width: 16px;
            height: 16px;
            border: 2px solid var(--color-accent);
            border-radius: 50%;
            position: relative;
        }

        .timer-icon::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 2px;
            height: 6px;
            background: var(--color-accent);
            transform: translate(-50%, -70%);
        }

        /* Security Notice */
        .security-notice {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            display: flex;
            gap: 15px;
        }

        .security-icon {
            width: 40px;
            height: 40px;
            background: rgba(239, 68, 68, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: #ef4444;
            font-size: 20px;
            font-weight: bold;
        }

        .security-content h3 {
            color: #ef4444;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .security-content p {
            color: var(--color-text-muted);
            font-size: 14px;
            line-height: 1.6;
        }

        /* Footer */
        .email-footer {
            background: var(--color-bg);
            padding: 30px;
            text-align: center;
            border-top: 1px solid var(--color-border);
        }

        .footer-text {
            color: var(--color-text-muted);
            font-size: 13px;
            margin-bottom: 15px;
        }

        .footer-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 15px;
        }

        .footer-link {
            color: var(--color-primary);
            text-decoration: none;
            font-size: 13px;
            transition: color 0.3s ease;
        }

        .footer-link:hover {
            color: var(--color-accent);
        }

        .social-icons {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 20px;
        }

        .social-icon {
            width: 36px;
            height: 36px;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-text-muted);
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .social-icon:hover {
            background: var(--color-primary);
            border-color: var(--color-primary);
            color: white;
            transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 600px) {
            .email-container {
                border-radius: 0;
            }

            .email-header {
                padding: 30px 20px;
            }

            .email-body {
                padding: 30px 20px;
            }

            .verification-code {
                font-size: 36px;
                letter-spacing: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Hero Image Cover -->
        <div style="width: 100%; height: 250px; overflow: hidden; position: relative; background: linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #22d3ee 100%);">
            <img 
                src="{{ url('images/welcome/mockup1.png') }}" 
                alt="DeCode"
                style="width: 100%; height: 100%; object-fit: cover; opacity: 0.3; position: absolute; top: 0; left: 0;"
            />
            <div style="position: relative; z-index: 1; padding: 40px 30px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                <div class="logo-container">
                    <div class="logo" style="margin-bottom: 15px;">
                        <span class="logo-text">⚫</span>
                    </div>
                </div>
                <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0 0 10px 0;">
                    {{ $type === 'register' ? 'Welcome to DeCode!' : 'Security Verification' }}
                </h1>
                <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;">
                    {{ $type === 'register' ? 'Verify your email to get started' : 'Confirm your login attempt' }}
                </p>
            </div>
        </div>

        <!-- Body -->
        <div class="email-body">
            <div class="greeting">
                Hello {{ $userName }}! 👋
            </div>

            <div class="message">
                @if($type === 'register')
                    Thank you for joining DeCode! We're excited to have you on board. To complete your registration and start building amazing projects, please verify your email address using the code below.
                @else
                    We detected a login attempt to your DeCode account. To ensure it's really you, please enter the verification code below.
                @endif
            </div>

            <!-- Verification Code -->
            <div class="code-container">
                <div class="code-label">Your Verification Code</div>
                <div class="verification-code">{{ $code }}</div>
                <div class="code-expiry">
                    <span class="timer-icon"></span>
                    <span>Expires in 10 minutes</span>
                </div>
            </div>

            <div class="message">
                Simply enter this code in the verification form to continue. The code is case-sensitive and will expire after 10 minutes for your security.
            </div>

            <!-- Security Notice -->
            <div class="security-notice">
                <div class="security-icon">⚠</div>
                <div class="security-content">
                    <h3>Security Notice</h3>
                    <p>
                        If you didn't request this {{ $type === 'register' ? 'registration' : 'login' }}, please ignore this email. 
                        Never share this code with anyone. DeCode support will never ask for your verification code.
                    </p>
                </div>
            </div>

            @if($type === 'register')
            <div class="message" style="text-align: center; margin-top: 30px;">
                <strong>Ready to create something amazing?</strong><br>
                Once verified, you'll have access to powerful visual development tools, real-time collaboration, and seamless deployment.
            </div>
            @endif
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <div class="footer-text">
                This email was sent from DeCode. If you have any questions, feel free to reach out to our support team.
            </div>

            <div class="footer-links">
                <a href="#" class="footer-link">Help Center</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
            </div>

            <div class="footer-text" style="margin-top: 20px; font-size: 12px;">
                &copy; {{ date('Y') }} DeCode. All rights reserved.<br>
                Building the future of visual development.
            </div>
        </div>
    </div>
</body>
</html>
