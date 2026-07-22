import { motion } from 'motion/react';
import { Users, CheckCircle2, Shield } from 'lucide-react';
import { SEO } from '@/components/layout/SEO';

const activeVolunteers = [
  { 
    name: 'Nikitha B', 
    role: 'Forensic Analyst & Researcher', 
    institute: 'Amity University',
    badge: 'Verified Contributor',
    id: 'FC-VOL-2026-025',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhofilNlkbJWvjAxFLk9i72sbgVT_2SwexBeXssxgZYH1EwiuEsAHceh5ESFONKrPOrvk1n7daXMe8lRVtXMpCtk20vWJC1BdHzG3V3sfQDuiBMD2E4WQYnge_a-ECnx6TSOjMB4s4ZFiEjPZM2WmCMhTeGN6mLT2Qjg333AwuyDoyapc3Vi8u_U6WcF4c/s1280/WhatsApp%20Image%202026-07-21%20at%2019.05.19.jpeg'
  },
  { 
    name: 'Kalyani Kumari', 
    role: 'Forensic Research Associate', 
    id: 'FC-VOL-2026-024',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjuehxkvibikGCm0qLOP1sjl7Ou7wRXIla_fGvD45I-dZMKsQd4qSPfzAoUsZroHrgmtUt54IP_9w2K_gfWAjoO8EWDgM3OOxTnz1ccn2_I9mix6j_Vv3LWYg2doyc6Tllf_NFlDk88-B3w-g1S15ZGUYmGmelXx-K4Uu2oPHk5rLGIn-jQm73RWoYoHsA/s1599/WhatsApp%20Image%202026-07-20%20at%2015.37.50.jpeg'
  },
  { 
    name: 'Deepanshi Malviya', 
    role: 'Forensic Research Associate', 
    id: 'FC-VOL-2026-011',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiPBgFaRzm6PvVzor12dmxsoWGZumwmp2fWBfYmUuhrOfiEi4fKpHCuEB6nWh8g3xkINoZEYWx573iZl4gf7Bg4-3LVNZPAS2Tbt2cult8nMup5605reOHB2UjDwEdahylfvhzbF-L9GPAvFaFXfBqY0hokbVcseReWgqLKr9_W9VhPmMX9PD-PHIQTAmM/s593/WhatsApp%20Image%202026-07-20%20at%2018.35.14.jpeg'
  },
  { 
    name: 'Poonam Kumari', 
    role: 'Forensic Research Associate', 
    id: 'FC-VOL-2026-007',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiIbeGbwnHkAU0OhswCeQNo2HojzYvTAKdNDiWNDfx8Hi3MTqbaI1BmqS4FrgpHXS2DLuHAZZ__NUtsQpEpX5COa-dvEJ1Nbc_ZXnY7rleNrlrRjRZ4gRzI1HRATrhdZXMqp4YXMmFXFSuV8RPUgeaCqJnelwtEB6QsYSo7WS-4gQY9cgLkvkgklIxV4-Q/s1528/WhatsApp%20Image%202026-07-20%20at%2015.28.04.jpeg'
  },
  { 
    name: 'Daniella Acheampong', 
    role: 'Forensic Research Associate', 
    id: 'FC-VOL-2026-015',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7NjsynbUNGEHtBcdAbwHvYcI97RxZjC37EFxJEzqjNfOuJoJE7NyqPj1wfF8V5BHp5xcqS05tY_PblKMJ8J5-i38Hh2d-uEvn_MHzo0AtMpXv3zM-qqd8R_hHZ11z48WAKzbwsmMQn9PrB4-IAEGYoDZh5pHKA2RYSzxLkCVU0uHgttUEhU3RToTOzQI/s818/WhatsApp%20Image%202026-07-20%20at%2018.15.07.jpeg'
  },
  {
    name: 'Okorie Ketandu Victory',
    role: 'Forensic Research Associate',
    id: 'FC-VOL-2026-013',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgE7VcpHg85KhrC4rtZL0F5p7UC7dx8E5Wm5MmWld5fPc7pSOG7AwdGokOkA6bQA1iHfkQXE2mOzeNYgFiozJyuML_VWEezpnocni5UndNdSZN6z0LP1guOm5ZycvNwGorhpjA3xSnRDN_fJST-iODVkAA-xlWd6CFvuFJ3dWVQMH-kkd9a0FFu3ZT6apQ/s2560/WhatsApp%20Image%202026-07-21%20at%2012.03.07.jpeg'
  },
  {
    name: 'Jubachukwu Adaeze Blessing',
    role: 'Forensic Research Associate',
    id: 'FC-VOL-2026-019',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgh_iueBO-7X7feaE-FKxU1oktps4zilIyn0s-NlfayYwbmcjlpUMue-20jw0tzhRQqNg7cFxllbvZHb6X90ZBS0bzz81BeUldr2_mCIpfa2UrIev8l0OvNt5td8MyVVTUxzO-g_o1TW0AG-JAiEX-63ZoId_hS8rvTnT5oq25O8OGHvR7ZSUl5RcylhjI/s1280/WhatsApp%20Image%202026-07-21%20at%2012.07.24.jpeg'
  },
  { 
    name: 'Akshat Dubey', 
    role: 'Forensic Research Associate', 
    id: 'FC-VOL-2026-002',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg05f4gjDDi6aXxKjisOyunf7i7gs_QooVdhQjCuia8fUcr7Z163SOYlXJXKezWDKoskumVkL8KEw-TgdTuuK7ho4jO1hou-5SvcTXNTKQrJx8UMi7_UIlehyphenhyphen_Ok0gCZGpmI2dkVnMHXA0ummzj6T2BacpwZl3sszoQcHE4eZhkFFdzE0ynQcXwAvJ_UC8/s3184/WhatsApp%20Image%202026-07-20%20at%2018.03.52.jpeg'
  },
  { 
    name: 'Yuvraj Nandan', 
    role: 'Forensic Research Associate', 
    id: 'FC-VOL-2026-009',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhtbaWNihBiYQrc2IVhwyJe6eAMKl8byl_Ps4pJ-3o0PhYl3Q1gTBXh3aX7EamTrilbsXb8q0EbyGkWMsUoV7CeZxzfm7UzENNPsiZbhDvxZE7gsUzNJT6LdlV0E7QrUdNOA3aLPoS-B1AiMVQbezJudrxwG6Mx0RkubP8A2Po0c1GuScrKxVYSKHiFPV8/s1280/WhatsApp%20Image%202026-07-20%20at%2017.57.24.jpeg'
  },
  { 
    name: 'Ashmita Mondal', 
    role: 'Content & Research Analyst', 
    id: 'FC-VOL-2026-004',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-zkKV5Tj2dgMMuKoR5LjolXH933bZhCNtB4utipWa4aZYCkqHNjfLXYlRHQtjWbd9QvYSCpwEayct4L0qx56o1jG2flQQM8umJrA1sKtQJ5VhSEQgUaRcF4KHrzMgwruxk2DjlFhmSEi6hF8RzDkpHEmHS_dv_PvH6QVm8GDdiVrfGE2xHAv5yw5sqyc/s800/WhatsApp%20Image%202026-07-20%20at%2015.33.04.jpeg'
  },
  { 
    name: 'Kailash Kaverappa', 
    role: 'Cyber Security Specialist', 
    id: 'FC-VOL-2026-018',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi1MG8ta4FQ_e8AldwfTKHRJPg9hoR9WkK2Uq564BcyYFpnTEtce_of4s_OUj25np6AQotVmLtfiWklmvDEwvzmcM1KVPViE0j8eCCsGZsz-LW0oV66pjZeLil9sPzIO-19wsyENCf0-8UCxrV_wd1gpwjciGl2CdYi-9zQtLnBizmV3w3kyqHMGzXASbA/s531/WhatsApp%20Image%202026-07-20%20at%2015.28.41.jpeg'
  },
  { 
    name: 'Vaishnavi Harpale', 
    role: 'Forensic Research Associate', 
    id: 'FC-VOL-2026-006',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhXOLO7xQbQGkj50IJiAEQl2_umbgwl4_ctOvQtxc5hyr3SAaoupAY1XzydJdG52H8GT65jviaQjECXYR0jgpa52cj19W3mfrLwK8w42n6RK3W1g66rpg4kWNgUbetdEL_rRq6r7z9R5_W5mgFmxgqq3QxBd-GhsBjrFVBFBYdgGFJPlxYUASsozrtTRtg/s3593/TBP_5.jpeg'
  },
  { 
    name: 'Nehal Rajput', 
    role: 'Senior Research Analyst', 
    id: 'FC-VOL-2026-001',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhdEP3_ff3FV7wwrQ-Q58LYaMTZR7md85f5yna7kDLe3tdHLnHHiWFYwR0w_l8MOSnUdzoZluSd_2plJUoswLZ7y-bV2pKG0GxU1glO3w3HfnGrVbJ2lFyhaL58pSiuYUdPM4KXq_gUCzqqPrjBSCXaMO-kYWCiSTUiUgHJELwJ-rhttvH74avKCPPNoko/s1599/WhatsApp%20Image%202026-07-20%20at%2015.39.02.jpeg'
  },
  { 
    name: 'Dolby Harne', 
    role: 'Forensic Research Associate', 
    id: 'FC-VOL-2026-016',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhfLdNfmlvifm0TbX_jMZ3w4Hu-B0eHMtzxhmE9E84M7Yv2VLTf6fl9ofyeAMqtXnZrwoZ922dUIVN52PeTQqZ2GVTMTwEZGY9tLtXtMtxFn0587XDwU6OX4ZKNqapc6VFniN1zNGRp6-ObJnlD5-OOrt-NejjhDw09OiYPO2LCsTwX83VbVLn6DkFGJyg/s1600/WhatsApp%20Image%202026-07-20%20at%2020.31.36.jpeg'
  },
  { 
    name: 'Shivaram More', 
    role: 'Cyber Forensic Specialist', 
    institute: 'National Forensic Sciences University', 
    badge: 'Verified Contributor',
    id: 'FC-VOL-2026-005',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEinv5YfMvu5Irf50Dd8wWstsAXuSMqrfGzFwJnVcw_yyWVqs1nkuVUc3xew9Bz8P6pLkIjLkiy5Z6hYGU6MM2tCK53on953crSAqR7-DxaW500nNkNfbEWQtD6seQOtgJEIAIz18YNTrzo8u18-dgNhsbPwxdAVsQzfevnXxndzpC81l85MZm9DYzOQeXg/s1599/WhatsApp%20Image%202026-07-20%20at%2021.36.38.jpeg'
  },
  { 
    name: 'Sheetal Kumari', 
    role: 'Forensic Analyst & Researcher', 
    institute: 'Amity University', 
    badge: 'Verified Contributor',
    id: 'FC-VOL-2026-017',
    image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgII8E3uDMB1pddGXFvPmpIWY6Qyy1XHfZxh3p4WjHgkB9XQyS6mZZaz4prDJ8iUtEkNDHAfMbt3Fpo9KqVQgmdPJX82pw6Fl0mpiwP3PNAtfexIm1Au5sosYHCZvYvVj4D8kwHnbLmx3Pu1RhIS2SkWmLzWFOTzfh5lj1dsFl2Hx6T4ojajz-XCTZm3YA/s1280/WhatsApp%20Image%202026-07-20%20at%205.59.10%20PM.jpeg'
  }
];

export default function Volunteers() {
  return (
    <div className="min-h-screen bg-base relative overflow-hidden">
      <SEO 
        title="ForenClue Volunteer League | Precision Mentorship"
        description="Join the ForenClue Global Volunteer Program. Work alongside expert forensic examiners, contribute to cases, and receive certified career mentorship."
        keywords="forensic volunteer, forensic science internship, cyber forensics community, forensic education, ForenClue career"
        image="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgKXJQb5UkVJcbG4a0rTFiNdhEa1wfFDfbew92r5tR1XXbYUkW7AbdMR_MSFwgCJg1zsDwpJX3jVns0as8FzPWrcK_SqiR9c-ah5jHmHksFm2AmiHtC46umM02LTfmeBBoxOjTRJnAzl6gW1dLY0AmDpDdQw2tl1L2D0R_hFonlFjnoNf22TNpbh9Hz9Kw/s1884/Screenshot%202026-07-20%20at%2012.06.52%E2%80%AFAM.png"
      />

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[35rem] z-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[25rem] h-[25rem] rounded-full bg-warning/5 blur-[100px]" />
        <div className="absolute top-[40%] right-[10%] w-[28rem] h-[28rem] rounded-full bg-warning/5 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 relative z-10 pt-10 sm:pt-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative inline-block mb-6 group mx-auto"
          >
            {/* Ambient background glow */}
            <div className="absolute inset-0 bg-warning/20 rounded-full blur-xl scale-95 opacity-75 group-hover:scale-105 transition-all duration-500" />
            
            <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden flex items-center justify-center p-2 bg-surface/40 backdrop-blur-sm border border-warning/20">
              <img 
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhng-MXzvpUPOTyJVM2FmjmzGdmvjTSkeZ7vcI0q-_PHyUk-coH-GCe4yFaAuwKySjVDD2LBWQXgYj5yfm5xLt_Pk2ujBmdcHY15RYx8Ozp-EP1KSGJcbxY4_tz0wYW2FfhT05OUvE0GcaGGGbm4Uav6v7l6rsN_Vlj-ip7KJogy0DD-SO0d6CiwjCh_PA/s1024/f66d107f-b714-43eb-834b-d2c97483071b.png" 
                alt="ForenClue Verified Volunteer Badge" 
                className="w-full h-full object-contain relative z-10"
                referrerPolicy="no-referrer"
              />
              
              {/* Infinite diagonal shine sweep */}
              <motion.div 
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 z-20"
                initial={{ left: '-100%' }}
                animate={{ left: '200%' }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 2.5,
                  ease: "easeInOut",
                  repeatDelay: 1.5
                }}
              />
            </div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-heading font-black tracking-tight uppercase text-text-main mb-6"
          >
            ForenClue <span className="text-transparent bg-clip-text bg-gradient-to-r from-warning to-warning-dark">Volunteers</span>
          </motion.h1>
        </div>

        {/* Verified Volunteer Directory */}
        <div className="mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeVolunteers.map((vol, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="bg-surface border border-black/10 dark:border-white/5 rounded-2xl p-6 relative group hover:border-warning/40 hover:-translate-y-1.5 hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.4),_0_0_25px_rgba(217,119,6,0.12)] transition-all duration-300 shadow-xl flex flex-col items-center text-center justify-between cursor-pointer"
              >
                {/* Status Indicator */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </div>

                <div className="absolute top-4 right-4 text-warning bg-warning/5 border border-warning/10 p-1.5 rounded-full">
                  <Shield size={14} className="stroke-[2.5]" />
                </div>

                {/* Profile Image / Avatar */}
                <div className="mt-4 mb-5 relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-warning/30 bg-base/80 flex items-center justify-center relative shadow-lg group-hover:border-warning transition-colors duration-300">
                    {vol.image ? (
                      <img 
                        src={vol.image} 
                        alt={vol.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-warning/10 to-warning/5 flex flex-col items-center justify-center relative">
                        <Users className="text-warning/30 w-8 h-8" />
                        <span className="absolute bottom-2 text-[9px] font-mono text-warning/60 font-bold uppercase">SECURE</span>
                      </div>
                    )}
                  </div>
                  {/* Digital Verification Check */}
                  <div className="absolute -bottom-1 right-2 bg-warning text-base-dark w-6 h-6 rounded-full flex items-center justify-center border-2 border-surface shadow-md">
                    <CheckCircle2 size={12} className="stroke-[3]" />
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2.5 w-full">
                  <div>
                    <h3 className="text-base font-heading font-black uppercase text-text-main group-hover:text-warning transition-colors tracking-tight">
                      {vol.name}
                    </h3>
                    <p className="text-[10px] font-mono text-warning font-bold uppercase tracking-widest mt-0.5">
                      {vol.id}
                    </p>
                  </div>


                </div>

                {/* Verification Status */}
                <div className="w-full border-t border-black/5 dark:border-white/5 pt-3 mt-4 flex items-center justify-center text-[9px] font-mono text-text-muted/60">
                  <span className="uppercase text-emerald-500/80 font-bold">VERIFIED VOLUNTEER</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
