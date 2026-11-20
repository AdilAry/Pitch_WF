# Arduino UNO Q — Quick Reference

**Source:** [UNO Q User Manual](https://docs.arduino.cc/tutorials/uno-q/user-manual/) · **Fetched:** 2026-10-14
The rendered page loads its text with JavaScript, so its content was read from the page's published source in the `arduino/docs-content` repository (`.../uno-q/tutorials/first-steps/user-manual/content.md`, latest commit 2026-10-14). Facts below come only from that page; anything it does not state is marked **UNVERIFIED**.

---

## 1. What it is
*Source: https://docs.arduino.cc/tutorials/uno-q/user-manual/ — Product Overview (fetched 2026-10-14)*

A single board with two processors:

- **MPU:** Qualcomm QRB2210, quad-core Cortex-A53 @ 2.0 GHz, Adreno 702 GPU. Runs **Debian Linux**.
- **MCU:** STM32U585, Cortex-M33 @ up to 160 MHz, 2 MB flash, 786 KB SRAM. Runs **Arduino sketches on Zephyr OS**.
- **Memory:** 2 GB or 4 GB LPDDR4 RAM; 16 GB or 32 GB eMMC.
- **Wireless:** WCBN3536A module, dual-band Wi-Fi 5 and Bluetooth 5.1. The radio sits on the MPU side.
- **I/O:** classic UNO form factor (shield compatible), 8×13 LED matrix, 4 RGB LEDs, Qwiic connector, one USB-C port (USB 3.1 Gen 1, DisplayPort out, 5 V 3 A sink).
- **Power:** USB-C 5 V 3 A, or 5 V on the 5V pin, or 7–24 V on VIN.

## 2. Setup (Windows)
*Source: https://docs.arduino.cc/tutorials/uno-q/user-manual/ — Hardware and Software Requirements, First Use, Arduino IDE (Beta) (fetched 2026-10-14)*

The manual has no Windows-only section. These are the general steps plus the one Windows-specific note it gives.

**You need:** a UNO Q, a USB-C cable, and **Arduino App Lab**. For standalone use you also need a USB-C dongle with external power delivery, plus a monitor, keyboard and mouse.

1. **Power the board.** It boots on its own; you do not need to press the power button.
2. **Choose a mode.**
   - **SBC (standalone):** App Lab is pre-installed on the board. The 4 GB model is recommended for this mode.
   - **PC-hosted:** download App Lab from https://www.arduino.cc/en/software/#app-lab-section, choose the Windows variant, install it, and connect the board over USB-C.
3. **Allow network discovery (Windows).** The first time App Lab runs, Windows Defender may ask about `mdns-discovery.exe`. **Allow** it, or the board will not be discovered. The prompt may not appear if Arduino IDE has been run before.
4. **Network Mode (optional).** A board on your LAN shows a **Network** tag in App Lab. Click it and enter the Linux password. Both modes can be used at the same time.
5. **Arduino IDE 2+ (optional, MCU only).** Open Boards Manager, search `UNO Q`, and install **Arduino UNO Q Zephyr Core**. Then select **Tools > Board > Arduino UNO Q Board > Arduino UNO Q** and choose the port.

- **UNVERIFIED:** whether Windows needs a separate USB driver. The manual mentions none.
- **UNVERIFIED:** Windows system requirements for App Lab, and the installer steps.
- **UNVERIFIED:** the first-boot setup wizard. The manual only refers to "Linux credentials configured during the board setup process".
- **UNVERIFIED:** the board's port name on Windows (for example, `COMx`).

## 3. Key concepts
*Source: https://docs.arduino.cc/tutorials/uno-q/user-manual/ — Install Arduino App Lab, Bridge RPC Library, From Serial to Monitor (fetched 2026-10-14)*

- **Two worlds.** Linux and Python run on the MPU. Real-time sketches run on the MCU. The STM32 drives the pins, the LED matrix, and RGB LEDs 3 and 4. Linux drives RGB LEDs 1 and 2 (through `/sys/class/leds`).
- **App Lab Apps.** An App combines a sketch (`sketch/sketch.ino`) and a Python program (`python/main.py`). **Bricks** are ready-made code building blocks, and preconfigured AI models are included.
- **Arduino IDE:** the IDE can program **only the MCU**. To program the MPU, use App Lab.
- **Bridge (RPC).** The two processors talk through the `Arduino_RouterBridge` library and Python's `Bridge`.
  - Methods: `Bridge.provide()` / `provide_safe()` expose a function; `Bridge.call()` calls one and waits for the result; `notify()` sends a call with no reply.
  - Transport: the **`arduino-router`** Linux service routes MessagePack RPC in a star topology. It listens on `/var/run/arduino-router.sock`.
- **Serial output.** From board platform **0.55.0** onward, `Serial.print()` shows up in the App Lab Console. The older `Monitor` object still works, but `Serial` is recommended for new code.
- **Run at startup.** In an App's menu (▼), switch on **Run at startup**. The CLI equivalent is `arduino-app-cli properties set default user:<APP>`.

## 4. Minimal working example
*Source: https://docs.arduino.cc/tutorials/uno-q/user-manual/ — Hello World Example; Hello World (Blink) (fetched 2026-10-14)*

**App Lab (no code needed):** open App Lab (it starts in **Examples**), open **Blink LED**, and click **Run**. The red LED in the built-in RGB LED blinks once per second.

**Arduino IDE:** use **File > Examples > 01.Basics > Blink**, or paste the sketch below, then click **Upload**:

```cpp
void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);
}
void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
  Serial.println("Hello World");
}
```

**Expected result:** the red LED blinks, and "Hello World" appears in the Serial Monitor.

## 5. Common pitfalls
*Source: https://docs.arduino.cc/tutorials/uno-q/user-manual/ — Requirements, Network Mode, Running an App at Startup, RGB LEDs, Debug UART, Router, Bridge, Qwiic, UART, PWM, Power Button (fetched 2026-10-14)*

**Setup and discovery**
- **Apple USB-C dongles are not supported.** Use another dongle with external power delivery.
- **The board doesn't appear in Network Mode.**
  - mDNS discovery needs **UDP port 5353** open.
  - Guest Wi-Fi, corporate or IoT networks, VPNs, and strict firewalls can all block discovery.
  - Reaching the board by SSH or IP address does **not** mean it will be listed.
- **The core is missing in Boards Manager.** Add `https://downloads.arduino.cc/packages/package_zephyr_index.json` to *Additional Boards Manager URLs*.
- **A built-in Example can't be set as the startup App.** Use **Copy and edit app** first.

**Bridge and serial**
- **Don't open `/dev/ttyHS1` on Linux.** `arduino-router` locks it, and opening it breaks the Bridge. If the Bridge seems stuck, run `sudo systemctl restart arduino-router`.
- **Bridge deadlocks:** never call `Bridge.call()`, `Monitor.print()` or `Serial.print()` inside a `provide()` handler.
- **Concurrency crashes:** for handlers that use Arduino APIs such as `digitalWrite` or `Serial`, use `provide_safe()`.
- **Wrong serial object.**
  - The D0/D1 hardware UART is `Serial1`.
  - `Serial` goes to the App Lab Console.
  - The Qwiic connector is `Wire1`, not `Wire`.

**Hardware**
- **RGB LEDs are active-low.** They turn on with logic 0.
- **Voltage limits:** the debug UART (JCTL) uses **1.8 V logic**, so use a 1.8 V USB-TTL adapter to avoid damage. The Qwiic connector is **3.3 V only**.
- **PWM frequency is fixed at 500 Hz.**
- **Holding the power button for 5 s or more reboots the Linux side.**
- **UNVERIFIED:** 5 V tolerance of the UNO-header GPIO pins. The manual does not state it.

## 6. Links
*Source: https://docs.arduino.cc/tutorials/uno-q/user-manual/ — links as they appear on the page (fetched 2026-10-14)*

- **Main page**
  - User Manual: https://docs.arduino.cc/tutorials/uno-q/user-manual/
- **Software**
  - App Lab download: https://www.arduino.cc/en/software/#app-lab-section
  - App Lab docs: https://docs.arduino.cc/software/app-lab/
  - Zephyr core index: https://downloads.arduino.cc/packages/package_zephyr_index.json
- **Board documents**
  - Power specification: https://docs.arduino.cc/tutorials/uno-q/power-specification/
  - Full pinout (PDF): https://docs.arduino.cc/resources/pinouts/ABX00162-full-pinout.pdf
  - Datasheet (PDF): https://docs.arduino.cc/resources/datasheets/ABX00162-datasheet.pdf
  - Schematics (PDF): https://docs.arduino.cc/resources/schematics/ABX00162-schematics.pdf
- **Linux**
  - Flash a Linux image: https://docs.arduino.cc/software/app-lab/configure/flash/
  - Debian guide: https://docs.arduino.cc/tutorials/uno-q/debian-guide/
- **Bridge source code**
  - Arduino Router: https://github.com/arduino/arduino-router
  - Arduino_RouterBridge: https://github.com/arduino-libraries/Arduino_RouterBridge
- **Support**
  - Forum: https://forum.arduino.cc/c/official-hardware/uno-family/uno-q/222
  - Help Center: https://support.arduino.cc/hc/en-us
