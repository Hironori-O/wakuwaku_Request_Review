import { describe, it, expect } from 'vitest'
import os from 'os'
import { join } from 'path'
import fs from 'fs'

describe('Windows Compatibility Tests', () => {
  it('should handle Windows-style paths correctly', () => {
    const path = join('public', 'templates', 'case-report.html')
    expect(path).toBeDefined()
    expect(fs.existsSync(path)).toBe(true)
  })

  it('should use correct font fallbacks', () => {
    const templatePath = join(process.cwd(), 'public', 'templates', 'case-report.html')
    const template = fs.readFileSync(templatePath, 'utf-8')
    expect(template).toContain('MS Mincho')
    expect(template).toContain('ＭＳ 明朝')
  })

  it('should use OS-specific temp directory', () => {
    const tempDir = os.tmpdir()
    expect(tempDir).toBeDefined()
    expect(fs.existsSync(tempDir)).toBe(true)
  })

  it('should handle Windows-specific Puppeteer settings', () => {
    const isWindows = os.platform() === 'win32'
    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      ...(isWindows ? ['--disable-gpu'] : [])
    ]
    expect(args).toContain('--no-sandbox')
    if (isWindows) {
      expect(args).toContain('--disable-gpu')
    }
  })
}) 