import React, { useEffect, useRef, useState } from 'react';
import './color-picker.css';
import {
  clamp,
  getSaturationCoordinates,
  hsvToRgb,
  parseColor,
  rgbToHex
} from '@/features/color-picker/utils';
import { Color, SatPos } from '@/features/color-picker/types';

interface ColorPickerProps {
  onChange?: (color: string) => void;
}

export default function ColorPicker({ onChange }: ColorPickerProps) {
  const [color, setColor] = useState<Color>(parseColor('#884646'));
  const [satCoords, setSatCoords] = useState<SatPos>(getSaturationCoordinates(color));
  const [huePosition, setHuePosition] = useState<number>(0);
  const satRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  function handleSaturationChange(e: React.MouseEvent) {
    if (!satRef.current?.parentElement) return;
    const { width, height, left, top } = satRef.current.parentElement.getBoundingClientRect();
    const x = clamp(e.clientX - left, 0, width);
    const y = clamp(e.clientY - top, 0, height);
    const s = (x / width) * 100;
    const v = 100 - (y / height) * 100;
    const rgb = hsvToRgb({ h: color?.hsv.h, s, v });
    setColor(parseColor(rgbToHex(rgb)));
    setSatCoords({ x: s, y: 100 - v });
  }

  function handleHueChange(e: React.MouseEvent) {
    if (!hueRef.current?.parentElement) return;
    const { width, left } = hueRef.current.parentElement.getBoundingClientRect();
    const x = clamp(e.clientX - left, 0, width);
    const h = Math.round((x / width) * 360);
    const hsv = { h, s: color?.hsv?.s, v: color?.hsv?.v };
    const rgb = hsvToRgb(hsv);
    setColor(parseColor(rgbToHex(rgb)));
    setHuePosition((x / width) * 100);
  }

  function handleMouseDownOnSat(e: MouseEvent) {
    function handleMouseMove(e: any) {
      const elem = satRef?.current;
      if (!elem) return;
      const x = e.clientX - satCoords.x;
      const y = e.clientY - satCoords.y;
      setSatCoords({ x, y });
      handleSaturationChange(e);
    }
    function handleMouseUp(e: MouseEvent) {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseDownOnHue() {
    function handleMouseMove(e: any) {
      const elem = hueRef?.current;
      if (!elem) return;
      const dx = e.clientX - huePosition;
      setHuePosition(dx);
      handleHueChange(e);
    }
    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  useEffect(() => {
    const elem = satRef?.current;
    if (!elem) return;
    elem.addEventListener('mousedown', handleMouseDownOnSat);
    return () => {
      elem.removeEventListener('mousedown', handleMouseDownOnSat);
    };
  }, [satRef, satCoords, color]);

  useEffect(() => {
    const elem = hueRef?.current;
    if (!elem) return;
    elem.addEventListener('mousedown', handleMouseDownOnHue);
    return () => {
      elem.removeEventListener('mousedown', handleMouseDownOnHue);
    };
  }, [hueRef, huePosition, color]);

  return (
    <div className="container">
      <div className="wrapper">
        <div
          className="saturation"
          style={{
            backgroundColor: `hsl(${color?.hsv.h}, 100%, 50%)`
          }}
          onClick={handleSaturationChange}>
          <div
            ref={satRef}
            className="saturation-indicator"
            style={{
              left: `${satCoords.x}%`,
              top: `${satCoords.y}%`
            }}
          />
        </div>
        <div className="hue" onClick={handleHueChange}>
          <div
            ref={hueRef}
            className="hue-indicator"
            style={{
              left: `${huePosition}%`
            }}
          />
        </div>
      </div>

      <div className="color-input-values">
        <div className="group">
          <div
            className="color-preview"
            style={{
              background: color.hex
            }}
          />
          <div>
            <label htmlFor="hex">Hex</label>
            <input
              id="hex"
              className="hex"
              placeholder="Hex"
              value={color?.hex}
              onChange={() => {}}
            />
          </div>
        </div>

        {/*<div className="group">*/}
        {/*  <div>*/}
        {/*    <label htmlFor="r">R</label>*/}
        {/*    <input*/}
        {/*      id="r"*/}
        {/*      className="rgb"*/}
        {/*      placeholder="R"*/}
        {/*      value={parsedColor.rgb.r}*/}
        {/*      onChange={(event) => handleRgbChange('r', event.target.value)}*/}
        {/*      inputMode="numeric"*/}
        {/*      pattern="[0-9]*"*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*  <div>*/}
        {/*    <label htmlFor="g">G</label>*/}
        {/*    <input*/}
        {/*      id="g"*/}
        {/*      className="rgb"*/}
        {/*      placeholder="G"*/}
        {/*      value={parsedColor.rgb.g}*/}
        {/*      onChange={(event) => handleRgbChange('g', event.target.value)}*/}
        {/*      inputMode="numeric"*/}
        {/*      pattern="[0-9]*"*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*  <div>*/}
        {/*    <label htmlFor="b">B</label>*/}
        {/*    <input*/}
        {/*      id="b"*/}
        {/*      className="rgb"*/}
        {/*      placeholder="B"*/}
        {/*      value={parsedColor.rgb.b}*/}
        {/*      onChange={(event) => handleRgbChange('b', event.target.value)}*/}
        {/*      inputMode="numeric"*/}
        {/*      pattern="[0-9]*"*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>
    </div>
  );
}
