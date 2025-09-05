{{-- resources/views/emails/workspace-invite.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workspace Invitation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .workspace-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
            border-left: 4px solid #667eea;
        }
        .workspace-name {
            font-size: 20px;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 8px 0;
        }
        .workspace-description {
            color: #718096;
            margin: 0;
        }
        .role-badge {
            display: inline-block;
            background: #e2e8f0;
            color: #4a5568;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            margin: 16px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-1px);
        }
        .invite-details {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
        }
        .invite-details h3 {
            color: #c53030;
            margin: 0 0 8px 0;
            font-size: 16px;
        }
        .invite-details p {
            margin: 0;
            color: #742a2a;
            font-size: 14px;
        }
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #718096;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .inviter-info {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 20px 0;
            padding: 16px;
            background: #f7fafc;
            border-radius: 8px;
        }
        .inviter-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 18px;
        }
        .inviter-details h4 {
            margin: 0;
            color: #2d3748;
            font-size: 16px;
        }
        .inviter-details p {
            margin: 4px 0 0 0;
            color: #718096;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            .header, .content, .footer {
                padding: 24px 20px;
            }
            .workspace-info {
                padding: 20px;
            }
            .inviter-info {
                flex-direction: column;
                text-align: center;
                gap: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>You're Invited!</h1>
            <p>Join {{ $workspace->name }} on {{ $appName }}</p>
        </div>

        <!-- Content -->
        <div class="content">
            <p>Hi there!</p>
            
            <p>{{ $inviter->name }} has invited you to join their workspace on {{ $appName }}, a powerful website builder with visual design tools and code generation.</p>

            <!-- Inviter Info -->
            <div class="inviter-info">
                <div class="inviter-avatar">
                    {{ strtoupper(substr($inviter->name, 0, 1)) }}{{ strtoupper(substr(explode(' ', $inviter->name)[1] ?? '', 0, 1)) }}
                </div>
                <div class="inviter-details">
                    <h4>{{ $inviter->name }}</h4>
                    <p>{{ $inviter->email }}</p>
                </div>
            </div>

            <!-- Workspace Info -->
            <div class="workspace-info">
                <h3 class="workspace-name">{{ $workspace->name }}</h3>
                @if($workspace->description)
                    <p class="workspace-description">{{ $workspace->description }}</p>
                @endif
                <div class="role-badge">
                    Role: {{ ucfirst($invite->role) }} - You can {{ $roleDescription }}
                </div>
            </div>

            <p>Click the button below to accept the invitation and start collaborating:</p>

            <div style="text-align: center;">
                <a href="{{ $inviteUrl }}" class="cta-button">Accept Invitation</a>
            </div>

            <!-- Important Details -->
            <div class="invite-details">
                <h3>⏰ Important Details</h3>
                <p>This invitation will expire in {{ $expiresInDays }} {{ $expiresInDays === 1 ? 'day' : 'days' }}. Make sure to accept it before {{ $invite->expires_at->format('F j, Y \a\t g:i A') }}.</p>
            </div>

            <p>If you don't have a {{ $appName }} account yet, you'll be prompted to create one when you click the invitation link. It only takes a moment!</p>

            <p>Questions about {{ $appName }}? Feel free to reach out to {{ $inviter->name }} at {{ $inviter->email }} or check out our help center.</p>

            <p>Looking forward to seeing what you'll build together!</p>

            <p>Best regards,<br>The {{ $appName }} Team</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This invitation was sent to {{ $invite->email }} by {{ $inviter->name }}.</p>
            <p>If you believe you received this email in error, you can safely ignore it.</p>
            <p>
                <a href="{{ config('app.url') }}">{{ $appName }}</a> | 
                <a href="{{ config('app.url') }}/help">Help Center</a> | 
                <a href="{{ config('app.url') }}/privacy">Privacy Policy</a>
            </p>
        </div>
    </div>
</body>
</html>