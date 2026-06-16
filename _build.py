import subprocess, sys, os

# Run the OpenNext build using cmd.exe properly
cwd = r"C:\Users\hanam\OneDrive\바탕 화면\클로드cowork\ai.ktoolu\ai-tools-hub"
script = os.path.join(cwd, "node_modules", ".bin", "opennextjs-cloudflare.cmd")

proc = subprocess.run(
    [script, "build"],
    cwd=cwd,
    capture_output=True,
    text=True,
    timeout=300,
    shell=True
)

print("STDOUT:", proc.stdout[:2000] if proc.stdout else "(empty)")
print("STDERR:", proc.stderr[:2000] if proc.stderr else "(empty)")
print("EXIT CODE:", proc.returncode)

sys.exit(proc.returncode)
