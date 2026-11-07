import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))

html = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog - Dalal Desk</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
</head>
<body class="font-inter">
  <h1>Blog - Dalal Desk</h1>
  <p>Blog page - rebuild in progress</p>
</body>
</html>'''

with open("blog.html", "w", encoding="utf-8") as f:
    f.write(html)
print("blog.html written, size:", len(html))