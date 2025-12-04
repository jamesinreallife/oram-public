<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>RoBoT Terminal</title>

<style>
    body {
        background: #000000;
        margin: 0;
        padding: 0;
        font-family: "Courier New", monospace;
        color: #00ff66;
        overflow: hidden;
    }

    #terminal-container {
        box-sizing: border-box;
        width: 100vw;
        height: 100vh;
        padding: 12px;
        display: flex;
        flex-direction: column;
    }

    #output {
        flex: 1;
        overflow-y: auto;
        padding-right: 4px;
        white-space: pre-wrap;
        word-wrap: break-word;
        font-size: 16px;
        line-height: 20px;
    }

    #input-line {
        display: flex;
        align-items: center;
        font-size: 16px;
    }

    #prompt {
        margin-right: 8px;
        flex-shrink: 0;
    }

    #cmd {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: #00ff66;
        font-family: inherit;
        font-size: inherit;
        padding: 4px 0;
    }

    @media (max-width: 600px) {
        #terminal-container { padding: 8px; }
        #output { font-size: 14px; line-height: 18px; }
        #input-line { font-size: 14px; }
    }
</style>
</head>

<body>

<div id="terminal-container">
    <div id="output">RoBoT Terminal Online\nType "help" to begin.\n</div>

    <div id="input-line">
        <div id="prompt">></div>
        <input 
            id="cmd" 
            type="text" 
            autocomplete="off" 
            autocorrect="off" 
            autocapitalize="none" 
            spellcheck="false"
        />
    </div>
</div>

<script>
    // THIS is the part that must point to your ORAM backend:
    const endpoint = "https://oram-public.onrender.com";

    const output = document.getElementById("output");
    const cmd = document.getElementById("cmd");

    function print(text) {
        output.textContent += text + "\n";
        output.scrollTop = output.scrollHeight;
    }

    async function sendCommand(command) {
        print("> " + command);

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command })
            });

            const data = await res.json();
            print(data.response || "[No response from ORAM]");
        } catch (e) {
            print("[Connection error: ORAM unreachable]");
        }
    }

    cmd.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const command = cmd.value.trim();
            cmd.value = "";
            sendCommand(command);
        }
    });

    window.addEventListener("load", () => {
        setTimeout(() => cmd.focus(), 200);
    });
    window.addEventListener("touchstart", () => cmd.focus());
</script>

</body>
</html>
