export function compactEncodedPayload(raw: string): string {
  return String(raw || '').replace(/\s+/g, '').trim()
}

export function looksLikeHex(s: string): boolean {
  if (s.length % 2 !== 0) return false
  return /^[0-9a-fA-F]+$/.test(s)
}

export function looksLikeBase64(s: string): boolean {
  if (s.length % 4 !== 0) return false
  return /^[A-Za-z0-9+/]+={0,2}$/.test(s)
}

export function decodeBinaryContent(data: Buffer, fallbackValue?: string): string {
  if (data.length === 0) return ''
  try {
    if (data.length >= 4) {
      const magicLE = data.readUInt32LE(0)
      const magicBE = data.readUInt32BE(0)
      if (magicLE === 0xFD2FB528 || magicBE === 0xFD2FB528) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fzstd = require('fzstd')
        const decompressed = fzstd.decompress(data)
        return Buffer.from(decompressed).toString('utf-8')
      }
    }
    const decoded = data.toString('utf-8')
    const replacementCount = (decoded.match(/\uFFFD/g) || []).length
    if (replacementCount < decoded.length * 0.2) {
      return decoded.replace(/\uFFFD/g, '')
    }
    if (fallbackValue && replacementCount > 0) {
      return fallbackValue
    }
    return data.toString('latin1')
  } catch {
    return fallbackValue || ''
  }
}

export function decodeMaybeCompressed(raw: any): string {
  if (!raw) return ''
  if (typeof raw === 'string') {
    if (raw.length === 0) return ''
    if (/^[0-9]+$/.test(raw)) {
      return raw
    }
    const compactRaw = compactEncodedPayload(raw)
    if (compactRaw.length > 16 && looksLikeHex(compactRaw)) {
      const bytes = Buffer.from(compactRaw, 'hex')
      if (bytes.length > 0) return decodeBinaryContent(bytes, raw)
    }
    if (compactRaw.length > 16 && looksLikeBase64(compactRaw)) {
      try {
        const bytes = Buffer.from(compactRaw, 'base64')
        return decodeBinaryContent(bytes, raw)
      } catch {
        return raw
      }
    }
    return raw
  }
  return ''
}

export function decodeMessageContent(messageContent: any, compressContent: any): string {
  let content = decodeMaybeCompressed(compressContent)
  if (!content || content.length === 0) {
    content = decodeMaybeCompressed(messageContent)
  }
  return content
}
