<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
        .container {
            background: white; padding: 25px; border-radius: 8px;
            max-width: 550px; margin: auto; border: 1px solid #ddd;
            text-align: center;
        }
        .title {
            font-size: 20px; font-weight: bold; margin-bottom: 15px; color: #333;
        }
        .token-box {
            background: #f0f0ff; padding: 12px; border-radius: 6px; 
            font-size: 22px; font-weight: bold; letter-spacing: 2px; border: 1px solid #d0d0ff;
            margin: 20px 0;
            word-break: break-all;
        }
        .instruction { font-size: 14px; margin-top: 10px; }
        .footer { font-size: 13px; color: #666; margin-top: 20px; }
    </style>
</head>
<body>

<div class="container">
    <div class="title">Yêu cầu đặt lại mật khẩu</div>

    <p>Xin chào <b>{{ $user->name }}</b>,</p>
    <p>Dưới đây là mã xác thực để đặt lại mật khẩu (hết hạn trong 15 phút):</p>

    <div class="token-box">{{ $token }}</div>

    <p class="instruction">
        Vui lòng <b>copy mã trên</b> để nhập mã và đổi mật khẩu mới.
    </p>

    <div class="footer">
        Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
    </div>
</div>

</body>
</html>
