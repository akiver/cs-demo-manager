
namespace DemoInfo
{
    // C# port of https://github.com/DSergiu/node-ice
    public class IceKey
    {
        private int size;
        private int rounds;
        private ulong[][] keySchedule;

        private ulong[][] spBox = new ulong[4][];

        private int[][] sMod =
        {
            new int[] { 333, 313, 505, 369 },
            new int[] { 379, 375, 319, 391 },
            new int[] { 361, 445, 451, 397 },
            new int[] { 397, 425, 395, 505 },
        };

        private int[][] sXor =
        {
            new int[] { 0x83, 0x85, 0x9b, 0xcd },
            new int[] { 0xcc, 0xa7, 0xad, 0x41 },
            new int[] { 0x4b, 0x2e, 0xd4, 0x33 },
            new int[] { 0xea, 0xcb, 0x2e, 0x04 },
        };

        private ulong[] pBox = {
            0x00000001, 0x00000080, 0x00000400, 0x00002000,
            0x00080000, 0x00200000, 0x01000000, 0x40000000,
            0x00000008, 0x00000020, 0x00000100, 0x00004000,
            0x00010000, 0x00800000, 0x04000000, 0x20000000,
            0x00000004, 0x00000010, 0x00000200, 0x00008000,
            0x00020000, 0x00400000, 0x08000000, 0x10000000,
            0x00000002, 0x00000040, 0x00000800, 0x00001000,
            0x00040000, 0x00100000, 0x02000000, 0x80000000,
        };

        private int[] keyrot = {
            0, 1, 2, 3, 2, 1, 3, 0,
            1, 3, 2, 0, 3, 1, 0, 2,
        };

        // 8-bit Galois Field multiplication of a by b, modulo m.
        // Just like arithmetic multiplication, except that
        // additions and subtractions are replaced by XOR.
        private ulong gf_mult(ulong a, ulong b, ulong m)
        {
            ulong res = 0;

            while (b != 0)
            {
                if ((b & 1) != 0)
                    res ^= a;

                a <<= 1;
                b >>= 1;

                if (a >= 256)
                    a ^= m;
            }

            return res;
        }

        // 8-bit Galois Field exponentiation.
        // Raise the base to the power of 7, modulo m.
        private ulong gf_exp7(ulong b, ulong m)
        {
            ulong x;

            if (b == 0)
                return 0;

            x = this.gf_mult(b, b, m);
            x = this.gf_mult(b, x, m);
            x = this.gf_mult(x, x, m);
            return this.gf_mult(b, x, m);
        }

        // Carry out the ICE 32-bit permutation.
        private ulong perm32(ulong x)
        {
            ulong res = 0;
            int i = 0;

            while (x != 0)
            {
                if ((x & 1) != 0)
                    res |= this.pBox[i];
                i++;
                x >>= 1;
            }

            return res;
        }

        // Initialise the substitution/permutation boxes.
        private void spBoxInit()
        {
            for (int i = 0; i < 4; i++)
            {
                this.spBox[i] = new ulong[1024];
                for (int j = 0; j < 1024; j++)
                {
                    this.spBox[i][j] = 0;
                }
            }

            for (int i = 0; i < 1024; i++)
            {
                int col = (i >> 1) & 0xff;
                int row = (i & 0x1) | ((i & 0x200) >> 8);
                ulong x;

                x = this.gf_exp7((ulong)(col ^ this.sXor[0][row]), (ulong)this.sMod[0][row]) << 24;
                this.spBox[0][i] = this.perm32(x);

                x = this.gf_exp7((ulong)(col ^ this.sXor[1][row]), (ulong)this.sMod[1][row]) << 16;
                this.spBox[1][i] = this.perm32(x);

                x = this.gf_exp7((ulong)(col ^ this.sXor[2][row]), (ulong)this.sMod[2][row]) << 8;
                this.spBox[2][i] = this.perm32(x);

                x = this.gf_exp7((ulong)(col ^ this.sXor[3][row]), (ulong)this.sMod[3][row]);
                this.spBox[3][i] = this.perm32(x);
            }
        }


        public IceKey(int level, byte[] key)
        {
            this.spBoxInit();

            if (level < 1)
            {
                this.size = 1;
                this.rounds = 8;
            }
            else
            {
                this.size = level;
                this.rounds = level * 16;
            }

            this.keySchedule = new ulong[this.rounds][];
            for (int i = 0; i < this.rounds; i++)
            {
                this.keySchedule[i] = new ulong[3];
                for (int j = 0; j < 3; j++)
                {
                    this.keySchedule[i][j] = 0;
                }
            }

            ulong[] kb = new ulong[4];
            for (int i = 0; i < 4; i++)
                kb[i] = 0;

            if (this.rounds == 8)
            {
                for (int i = 0; i < 4; i++)
                    kb[3 - i] = (ulong)(((key[i * 2] & 0xff) << 8) | (key[i * 2 + 1] & 0xff));
                this.scheduleBuild(kb, 0, 0);
                return;
            }

            for (int i = 0; i < this.size; i++)
            {
                for (int j = 0; j < 4; j++)
                    kb[3 - j] = (ulong)(((key[i * 8 + j * 2] & 0xff) << 8) | (key[i * 8 + j * 2 + 1] & 0xff));
                this.scheduleBuild(kb, i * 8, 0);
                this.scheduleBuild(kb, this.rounds - 8 - i * 8, 8);
            }
        }

        // Set 8 rounds [n, n+7] of the key schedule of an ICE key.
        private void scheduleBuild(ulong[] kb, int n, int krot_idx)
        {
            for (int i = 0; i < 8; i++)
            {
                int j;
                int kr = this.keyrot[krot_idx + i];
                ulong[] subkey = this.keySchedule[n + i];

                for (j = 0; j < 3; j++)
                    this.keySchedule[n + i][j] = 0;

                for (j = 0; j < 15; j++)
                {
                    ulong curr_sk = (ulong)(j % 3);

                    for (int k = 0; k < 4; k++)
                    {
                        ulong curr_kb = kb[(kr + k) & 3];
                        ulong bit = (curr_kb & 1);

                        subkey[curr_sk] = (subkey[curr_sk] << 1) | bit;
                        kb[(kr + k) & 3] = (curr_kb >> 1) | ((bit ^ 1) << 15);
                    }
                }
            }
        }

        // The single round ICE f function.
        private ulong roundFunc(ulong p, ulong[] subkey)
        {
            ulong tl = ((p >> 16) & 0x3ff) | (((p >> 14) | (p << 18)) & 0xffc00);
            ulong tr = (p & 0x3ff) | ((p << 2) & 0xffc00);

            ulong al = subkey[2] & (tl ^ tr);
            ulong ar = al ^ tr;
            al ^= tl;
            al ^= subkey[0];
            ar ^= subkey[1];

            return (this.spBox[0][al >> 10] | this.spBox[1][al & 0x3ff] | this.spBox[2][ar >> 10] | this.spBox[3][ar & 0x3ff]);
        }

        // Encrypt a block of 8 bytes of data.
        public void Encrypt(byte[] plaintext, byte[] ciphertext)
        {
            int i;
            ulong l = 0, r = 0;

            for (i = 0; i < 4; i++)
            {
                l |= (uint)((plaintext[i] & 0xff) << (24 - i * 8));
                r |= (uint)((plaintext[i + 4] & 0xff) << (24 - i * 8));
            }

            for (i = 0; i < this.rounds; i += 2)
            {
                l ^= this.roundFunc(r, this.keySchedule[i]);
                r ^= this.roundFunc(l, this.keySchedule[i + 1]);
            }

            for (i = 0; i < 4; i++)
            {
                ciphertext[3 - i] = (byte)(r & 0xff);
                ciphertext[7 - i] = (byte)(l & 0xff);

                r >>= 8;
                l >>= 8;
            }
        }

        // Decrypt a block of 8 bytes of data.
        public void Decrypt(byte[] ciphertext, byte[] plaintext)
        {
            int i;
            ulong l = 0;
            ulong r = 0;

            for (i = 0; i < 4; i++)
            {
                l |= (ulong)(ciphertext[i] & 0xff) << (24 - i * 8);
                r |= (ulong)(ciphertext[i + 4] & 0xff) << (24 - i * 8);
            }

            for (i = this.rounds - 1; i > 0; i -= 2)
            {
                l ^= this.roundFunc(r, this.keySchedule[i]);
                r ^= this.roundFunc(l, this.keySchedule[i - 1]);
            }

            for (i = 0; i < 4; i++)
            {
                plaintext[3 - i] = (byte)(r & 0xff);
                plaintext[7 - i] = (byte)(l & 0xff);

                r >>= 8;
                l >>= 8;
            }
        }

        public byte[] DecryptFull(byte[] enc)
        {
            int to = enc.Length;
            byte[] dec = new byte[to];
            byte[] cipherHolder = new byte[8];
            byte[] plainHolder = new byte[8];
            int from = 0;

            int k = 0;

            // decrypt full blocks
            while (from + 8 <= to)
            {
                for (int i = 0; i < 8; i++)
                {
                    cipherHolder[i] = enc[from + i];
                }

                this.Decrypt(cipherHolder, plainHolder);

                for (int i = 0; i < 8; i++)
                {
                    dec[k + i] = plainHolder[i];
                }

                k += 8;
                from += 8;
            }

            // remaining bytes do not get encryption, just copy them
            if (((to - from) & 0x7) != 0)
            {
                for (int i = from; i < to; i++)
                {
                    dec[k] = enc[i];
                    k++;
                }
            }

            return dec;
        }
    }
}
