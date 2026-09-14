# -*- mode: python ; coding: utf-8 -*-
"""
古韵AI 后端 PyInstaller 打包规格（V2.3 优化版）

关键优化：
- excludes 把 music21 及其传递依赖（numpy / scipy / matplotlib / pandas / PIL / lxml /
  sqlalchemy / openpyxl / numba / llvmlite / tkinter / IPython / jedi / pyarrow）排除
- 主流程用不到这些（minimax 校验、DeepSeek 联调、SQLite、FastAPI 全部不需要）
- P1 兜底（曲谱/MIDI）已移出主流程，遗留代码保留在源码层面即可，不需要进 EXE
- excludes 同时去掉 win32com、black、pytest 等开发期依赖，避免污染主包

必加的 hiddenimports（PyInstaller 自动发现遗漏的）：
- aiosqlite（异步 SQLite 驱动）
- sqlite3
- uvicorn 系列（spec 里已有）
"""
a = Analysis(
    ['app/main.py'],
    pathex=[],
    binaries=[],
    datas=[('app', 'app')],
    hiddenimports=[
        # uvicorn 完整运行所需
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        # aiosqlite 异步 SQLite（PyInstaller 默认漏）
        'aiosqlite',
        'sqlite3',
        # dotenv
        'dotenv',
        'multipart',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # 音乐21 整套科学计算栈（主流程不需要）
        'music21',
        'numpy', 'numpy.*',
        'scipy', 'scipy.*',
        'matplotlib', 'matplotlib.*',
        'pandas', 'pandas.*',
        'PIL', 'PIL.*',
        'lxml', 'lxml.*',
        'sqlalchemy', 'sqlalchemy.*',
        'openpyxl', 'openpyxl.*',
        'numba', 'numba.*',
        'llvmlite', 'llvmlite.*',
        'tkinter', 'tkinter.*',
        'IPython', 'IPython.*',
        'jedi', 'jedi.*',
        'pyarrow',
        'pytest', 'pytest.*',
        'black', 'black.*',
        'win32com', 'win32com.*',
        'pywintypes',
        'pythoncom',
        'pytz',
        'botocore', 'botocore.*',
        'boto3',
        'awscli',
        'setuptools', 'setuptools.*',
        'pkg_resources',
    ],
    noarchive=False,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='gu-yun-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
