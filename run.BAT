@ECHO OFF
TITLE 바나나 서버
IF EXIST CONFIG.JSON (
    node index.js
) ELSE (
    START BANANA /I
)