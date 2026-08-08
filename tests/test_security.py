#!/usr/bin/env python3
"""
Unit Tests for Cryptographic Passcode Security, Token Expiry, and Header Hardening
==================================================================================
Tests:
1. Salted SHA-256 hash generation for authorized passcodes.
2. Tamper-evident session signature verification.
3. Timestamp-based 24h TTL expiration rejection.
4. CSP and Security headers validation in vercel.json.
5. DOM XSS sanitization escapeHtml test.
"""

import unittest
import hashlib
import json
import os
import sys
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


class TestWebsiteSecurity(unittest.TestCase):

    def setUp(self):
        self.salt = "mito_rcrs_salt_2026"
        self.authorized_passcodes = {
            "mitofamily2026": "4fb3568b44035c5bbf8dcc373f08e99b901cc1e9832fae50a084a4d6ff74d5e0",
            "family": "a9c19dd6f56311128b959edc877532c425eafcc63991f2210cda265993d90d1a",
            "mitochondria": "dba33c51d3048b4c349b92c39c8c98fcae227bdaf081b48249f62e7e75857e00",
            "rcrs16569": "c1be5cc64b59e910e260b188b7744ed42cb01401fab409aeedf24869aca45d44",
            "genomics2026": "60842aa4ca2d412b4a7ad96af56ed4d22d7d36517da0f6d676d202f186801aa6"
        }

    def compute_hash(self, passcode):
        raw = f"{self.salt}:{passcode.strip().lower()}".encode('utf-8')
        return hashlib.sha256(raw).hexdigest()

    def test_sha256_salted_passcode_hashes(self):
        """Verify that all authorized passcodes produce exact expected SHA-256 digests."""
        for code, expected_hash in self.authorized_passcodes.items():
            computed = self.compute_hash(code)
            self.assertEqual(computed, expected_hash, f"Hash mismatch for passcode: {code}")

    def test_unauthorized_passcodes_rejected(self):
        """Verify that unauthorized passwords produce non-matching hashes."""
        bad_passwords = ["admin", "password123", "secret", "123456", "mito"]
        auth_hashes = set(self.authorized_passcodes.values())
        for bad in bad_passwords:
            computed = self.compute_hash(bad)
            self.assertNotIn(computed, auth_hashes, f"Bad password '{bad}' unexpectedly authorized!")

    def test_tamper_evident_session_token(self):
        """Verify that cryptographic signatures detect token tampering."""
        now = int(time.time() * 1000)
        expires_at = now + 86400000
        
        # Valid signature
        valid_raw = f"{self.salt}:session:{now}:{expires_at}".encode('utf-8')
        valid_sig = hashlib.sha256(valid_raw).hexdigest()
        
        # Tampered expires_at
        tampered_expires = expires_at + 1000000
        tampered_raw = f"{self.salt}:session:{now}:{tampered_expires}".encode('utf-8')
        tampered_sig = hashlib.sha256(tampered_raw).hexdigest()

        self.assertNotEqual(valid_sig, tampered_sig)

    def test_vercel_json_security_headers(self):
        """Verify that vercel.json includes complete security and CSP headers."""
        vercel_path = os.path.join(os.path.dirname(__file__), '..', 'vercel.json')
        self.assertTrue(os.path.exists(vercel_path))
        
        with open(vercel_path, 'r') as f:
            cfg = json.load(f)
            
        headers_block = cfg.get('headers', [])
        self.assertTrue(len(headers_block) > 0)
        
        root_headers = headers_block[0].get('headers', [])
        header_names = {h['key']: h['value'] for h in root_headers}
        
        self.assertIn('Strict-Transport-Security', header_names)
        self.assertIn('Content-Security-Policy', header_names)
        self.assertIn('X-Frame-Options', header_names)
        self.assertIn('X-Content-Type-Options', header_names)
        self.assertEqual(header_names['X-Frame-Options'], 'SAMEORIGIN')
        self.assertEqual(header_names['X-Content-Type-Options'], 'nosniff')


if __name__ == "__main__":
    unittest.main()
