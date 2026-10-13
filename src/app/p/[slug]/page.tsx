import { createClient } from '@supabase/supabase-js'

interface CustomLink { label: string; url: string; icon?: string }

interface NFCProfile {
  id: string; slug: string; display_name: string; tagline: string | null
  company: string | null; avatar_url: string | null; whatsapp: string | null
  email: string | null; website: string | null; instagram: string | null
  tiktok: string | null; linkedin: string | null; facebook: string | null
  youtube: string | null; custom_links: CustomLink[]; is_active: boolean
  views: number; template: string
}

const T: Record<string, {bg:string;heroBg:string;accent:string;accent2:string;cardBg:string;cardBorder:string;nameCss:string;radius:string;btnRadius:string;footerBg:string;avatarBorder:string;light?:boolean}> = {
  default:{bg:"#0a0a0a",heroBg:"linear-gradient(180deg,#111 0%,#0a0a0a 100%)",accent:"#00cfff",accent2:"#00ff94",cardBg:"#161616",cardBorder:"#1f1f1f",nameCss:"linear-gradient(90deg,#00cfff,#00ff94)",radius:"14px",btnRadius:"14px",footerBg:"#00cfff0d",avatarBorder:"#00cfff44"},
  ocean:{bg:"linear-gradient(160deg,#00091a 0%,#001a3a 45%,#000c20 100%)",heroBg:"linear-gradient(180deg,#001a3a 0%,#00091a 100%)",accent:"#60efff",accent2:"#0096ff",cardBg:"#00112a",cardBorder:"#002040",nameCss:"linear-gradient(90deg,#60efff,#0096ff)",radius:"14px",btnRadius:"14px",footerBg:"#60efff0d",avatarBorder:"#60efff44"},
  gold:{bg:"linear-gradient(160deg,#0d0900 0%,#1a1200 50%,#0a0800 100%)",heroBg:"linear-gradient(180deg,#1a1200 0%,#0d0900 100%)",accent:"#d4af37",accent2:"#ffd700",cardBg:"#110e00",cardBorder:"#2a2000",nameCss:"linear-gradient(90deg,#d4af37,#ffd700)",radius:"14px",btnRadius:"14px",footerBg:"#d4af370d",avatarBorder:"#d4af3744"},
  aurora:{bg:"linear-gradient(160deg,#030014 0%,#0a0020 30%,#001a10 70%,#050020 100%)",heroBg:"linear-gradient(180deg,#0a0020 0%,#001a10 100%)",accent:"#00ff94",accent2:"#a855f7",cardBg:"#0a0018",cardBorder:"#1a0030",nameCss:"linear-gradient(90deg,#00ff94,#a855f7)",radius:"14px",btnRadius:"14px",footerBg:"#00ff940d",avatarBorder:"#00ff9444"},
  sunset:{bg:"linear-gradient(160deg,#180010 0%,#1f0a00 55%,#0f0000 100%)",heroBg:"linear-gradient(180deg,#1f0a00 0%,#180010 100%)",accent:"#ff6b35",accent2:"#f7931a",cardBg:"#150800",cardBorder:"#2a1000",nameCss:"linear-gradient(90deg,#ff6b35,#f7931a)",radius:"14px",btnRadius:"14px",footerBg:"#ff6b350d",avatarBorder:"#ff6b3544"},
  minimal:{bg:"#f2f2f2",heroBg:"linear-gradient(180deg,#ffffff 0%,#f2f2f2 100%)",accent:"#0d0d0d",accent2:"#444444",cardBg:"#ffffff",cardBorder:"#e5e5e5",nameCss:"",radius:"14px",btnRadius:"14px",footerBg:"#0d0d0d08",avatarBorder:"#0d0d0d22",light:true},
  neon:{bg:"#0a0010",heroBg:"linear-gradient(180deg,#12001a 0%,#0a0010 100%)",accent:"#ff00ff",accent2:"#ff6fff",cardBg:"#13001a",cardBorder:"#2a0040",nameCss:"linear-gradient(90deg,#ff00ff,#ff6fff)",radius:"14px",btnRadius:"14px",footerBg:"#ff00ff0d",avatarBorder:"#ff00ff44"},
  electric:{bg:"#000510",heroBg:"linear-gradient(180deg,#000a20 0%,#000510 100%)",accent:"#00b4d8",accent2:"#0096ff",cardBg:"#00081a",cardBorder:"#001030",nameCss:"linear-gradient(90deg,#00b4d8,#0096ff)",radius:"14px",btnRadius:"14px",footerBg:"#00b4d80d",avatarBorder:"#00b4d844"},
  neongreen:{bg:"#020d02",heroBg:"linear-gradient(180deg,#041804 0%,#020d02 100%)",accent:"#39ff14",accent2:"#00ff41",cardBg:"#041204",cardBorder:"#0a2a0a",nameCss:"linear-gradient(90deg,#39ff14,#00ff41)",radius:"4px",btnRadius:"4px",footerBg:"#39ff140d",avatarBorder:"#39ff1444"},
  cyberpunk:{bg:"#0a0010",heroBg:"linear-gradient(180deg,#100020 0%,#0a0010 100%)",accent:"#f9e900",accent2:"#00f9ff",cardBg:"#120018",cardBorder:"#28003a",nameCss:"linear-gradient(90deg,#f9e900,#00f9ff)",radius:"2px",btnRadius:"2px",footerBg:"#f9e9000d",avatarBorder:"#f9e90044"},
  retro:{bg:"#0d0221",heroBg:"linear-gradient(180deg,#12042e 0%,#0d0221 100%)",accent:"#ff2d78",accent2:"#ffeb3b",cardBg:"#120330",cardBorder:"#240560",nameCss:"linear-gradient(90deg,#ff2d78,#ffeb3b)",radius:"4px",btnRadius:"4px",footerBg:"#ff2d780d",avatarBorder:"#ff2d7844"},
  matrix:{bg:"#000300",heroBg:"linear-gradient(180deg,#000c00 0%,#000300 100%)",accent:"#00ff41",accent2:"#008f11",cardBg:"#010801",cardBorder:"#00200a",nameCss:"linear-gradient(90deg,#00ff41,#008f11)",radius:"0px",btnRadius:"2px",footerBg:"#00ff410d",avatarBorder:"#00ff4144"},
  midnight:{bg:"linear-gradient(160deg,#000814 0%,#001233 50%,#000814 100%)",heroBg:"linear-gradient(180deg,#001233 0%,#000814 100%)",accent:"#4cc9f0",accent2:"#7209b7",cardBg:"#000e22",cardBorder:"#001a3a",nameCss:"linear-gradient(90deg,#4cc9f0,#7209b7)",radius:"14px",btnRadius:"14px",footerBg:"#4cc9f00d",avatarBorder:"#4cc9f044"},
  galaxy:{bg:"linear-gradient(160deg,#050015 0%,#110028 40%,#001a18 100%)",heroBg:"linear-gradient(180deg,#110028 0%,#001a18 100%)",accent:"#da77ff",accent2:"#00ffe1",cardBg:"#080018",cardBorder:"#1a0035",nameCss:"linear-gradient(90deg,#da77ff,#00ffe1)",radius:"14px",btnRadius:"14px",footerBg:"#da77ff0d",avatarBorder:"#da77ff44"},
  space:{bg:"#000000",heroBg:"radial-gradient(ellipse at 50% 0%,#0a0020 0%,#000000 70%)",accent:"#e0e0e0",accent2:"#ffffff",cardBg:"#080808",cardBorder:"#181818",nameCss:"linear-gradient(90deg,#e0e0e0,#ffffff)",radius:"14px",btnRadius:"14px",footerBg:"#ffffff0d",avatarBorder:"#ffffff22"},
  aurora2:{bg:"linear-gradient(160deg,#000820 0%,#001a14 50%,#080020 100%)",heroBg:"linear-gradient(180deg,#001a14 0%,#080020 100%)",accent:"#7fffd4",accent2:"#00cfff",cardBg:"#000c18",cardBorder:"#001c28",nameCss:"linear-gradient(90deg,#7fffd4,#00cfff)",radius:"14px",btnRadius:"14px",footerBg:"#7fffd40d",avatarBorder:"#7fffd444"},
  dusk:{bg:"linear-gradient(160deg,#100a1e 0%,#1e1020 40%,#280a05 100%)",heroBg:"linear-gradient(180deg,#1e1020 0%,#280a05 100%)",accent:"#f8961e",accent2:"#b388ff",cardBg:"#160c1c",cardBorder:"#2c1830",nameCss:"linear-gradient(90deg,#f8961e,#b388ff)",radius:"14px",btnRadius:"14px",footerBg:"#f8961e0d",avatarBorder:"#f8961e44"},
  storm:{bg:"linear-gradient(160deg,#0a0c14 0%,#141826 50%,#0a0c14 100%)",heroBg:"linear-gradient(180deg,#141826 0%,#0a0c14 100%)",accent:"#90e0ef",accent2:"#caf0f8",cardBg:"#0f1220",cardBorder:"#202840",nameCss:"linear-gradient(90deg,#90e0ef,#caf0f8)",radius:"14px",btnRadius:"14px",footerBg:"#90e0ef0d",avatarBorder:"#90e0ef44"},
  obsidian:{bg:"#000000",heroBg:"linear-gradient(180deg,#0a0a0a 0%,#000000 100%)",accent:"#ffffff",accent2:"#cccccc",cardBg:"#0a0a0a",cardBorder:"#1a1a1a",nameCss:"",radius:"0px",btnRadius:"4px",footerBg:"#ffffff0d",avatarBorder:"#ffffff22"},
  ruby:{bg:"linear-gradient(160deg,#160010 0%,#2a001e 50%,#160010 100%)",heroBg:"linear-gradient(180deg,#2a001e 0%,#160010 100%)",accent:"#e0115f",accent2:"#ff2d78",cardBg:"#1c0018",cardBorder:"#380030",nameCss:"linear-gradient(90deg,#e0115f,#ff2d78)",radius:"14px",btnRadius:"14px",footerBg:"#e0115f0d",avatarBorder:"#e0115f44"},
  sapphire:{bg:"linear-gradient(160deg,#000820 0%,#001040 50%,#000820 100%)",heroBg:"linear-gradient(180deg,#001040 0%,#000820 100%)",accent:"#4169e1",accent2:"#7b9fff",cardBg:"#000c28",cardBorder:"#001a50",nameCss:"linear-gradient(90deg,#4169e1,#7b9fff)",radius:"14px",btnRadius:"14px",footerBg:"#4169e10d",avatarBorder:"#4169e144"},
  emerald:{bg:"linear-gradient(160deg,#000f08 0%,#00200f 50%,#000f08 100%)",heroBg:"linear-gradient(180deg,#00200f 0%,#000f08 100%)",accent:"#00c86a",accent2:"#50fa7b",cardBg:"#001408",cardBorder:"#003018",nameCss:"linear-gradient(90deg,#00c86a,#50fa7b)",radius:"14px",btnRadius:"14px",footerBg:"#00c86a0d",avatarBorder:"#00c86a44"},
  bronze:{bg:"linear-gradient(160deg,#100800 0%,#201200 50%,#100800 100%)",heroBg:"linear-gradient(180deg,#201200 0%,#100800 100%)",accent:"#cd7f32",accent2:"#e8a957",cardBg:"#140a00",cardBorder:"#281800",nameCss:"linear-gradient(90deg,#cd7f32,#e8a957)",radius:"14px",btnRadius:"14px",footerBg:"#cd7f320d",avatarBorder:"#cd7f3244"},
  copper:{bg:"linear-gradient(160deg,#12080a 0%,#1e1000 50%,#12080a 100%)",heroBg:"linear-gradient(180deg,#1e1000 0%,#12080a 100%)",accent:"#c87941",accent2:"#f09642",cardBg:"#161008",cardBorder:"#301c10",nameCss:"linear-gradient(90deg,#c87941,#f09642)",radius:"14px",btnRadius:"14px",footerBg:"#c879410d",avatarBorder:"#c8794144"},
  silver:{bg:"#0d0d0f",heroBg:"linear-gradient(180deg,#1a1a1e 0%,#0d0d0f 100%)",accent:"#c0c0c0",accent2:"#e8e8e8",cardBg:"#161618",cardBorder:"#2a2a2e",nameCss:"linear-gradient(90deg,#c0c0c0,#e8e8e8)",radius:"14px",btnRadius:"14px",footerBg:"#c0c0c00d",avatarBorder:"#c0c0c044"},
  platinum:{bg:"linear-gradient(160deg,#0a0c12 0%,#12161e 50%,#0a0c12 100%)",heroBg:"linear-gradient(180deg,#12161e 0%,#0a0c12 100%)",accent:"#e5e4e2",accent2:"#f5f5f0",cardBg:"#0e1018",cardBorder:"#1e2030",nameCss:"linear-gradient(90deg,#e5e4e2,#f5f5f0)",radius:"14px",btnRadius:"14px",footerBg:"#e5e4e20d",avatarBorder:"#e5e4e244"},
  forest:{bg:"linear-gradient(160deg,#010d05 0%,#02190a 50%,#011208 100%)",heroBg:"linear-gradient(180deg,#02190a 0%,#010d05 100%)",accent:"#57cc99",accent2:"#38a3a5",cardBg:"#021208",cardBorder:"#0a2a10",nameCss:"linear-gradient(90deg,#57cc99,#38a3a5)",radius:"14px",btnRadius:"14px",footerBg:"#57cc990d",avatarBorder:"#57cc9944"},
  jade:{bg:"linear-gradient(160deg,#001612 0%,#002a22 50%,#001612 100%)",heroBg:"linear-gradient(180deg,#002a22 0%,#001612 100%)",accent:"#00b894",accent2:"#55efc4",cardBg:"#001e18",cardBorder:"#003830",nameCss:"linear-gradient(90deg,#00b894,#55efc4)",radius:"14px",btnRadius:"14px",footerBg:"#00b8940d",avatarBorder:"#00b89444"},
  coffee:{bg:"linear-gradient(160deg,#1a0f00 0%,#2a1800 50%,#1a0f00 100%)",heroBg:"linear-gradient(180deg,#2a1800 0%,#1a0f00 100%)",accent:"#a0785a",accent2:"#d4a76a",cardBg:"#1e1200",cardBorder:"#3a2200",nameCss:"linear-gradient(90deg,#a0785a,#d4a76a)",radius:"14px",btnRadius:"14px",footerBg:"#a0785a0d",avatarBorder:"#a0785a44"},
  lava:{bg:"linear-gradient(160deg,#1a0000 0%,#2a0800 50%,#1a0000 100%)",heroBg:"linear-gradient(180deg,#2a0800 0%,#1a0000 100%)",accent:"#ff4500",accent2:"#ff8c00",cardBg:"#1e0400",cardBorder:"#3a0a00",nameCss:"linear-gradient(90deg,#ff4500,#ff8c00)",radius:"14px",btnRadius:"14px",footerBg:"#ff45000d",avatarBorder:"#ff450044"},
  lime:{bg:"linear-gradient(160deg,#0a1400 0%,#162200 50%,#0a1400 100%)",heroBg:"linear-gradient(180deg,#162200 0%,#0a1400 100%)",accent:"#a3e635",accent2:"#84cc16",cardBg:"#0e1a00",cardBorder:"#1e3000",nameCss:"linear-gradient(90deg,#a3e635,#84cc16)",radius:"14px",btnRadius:"14px",footerBg:"#a3e6350d",avatarBorder:"#a3e63544"},
  tropical:{bg:"linear-gradient(160deg,#001e1a 0%,#00301c 50%,#001814 100%)",heroBg:"linear-gradient(180deg,#00301c 0%,#001e1a 100%)",accent:"#00e5cc",accent2:"#ffdd57",cardBg:"#002820",cardBorder:"#004a38",nameCss:"linear-gradient(90deg,#00e5cc,#ffdd57)",radius:"20px",btnRadius:"20px",footerBg:"#00e5cc0d",avatarBorder:"#00e5cc44"},
  amber:{bg:"linear-gradient(160deg,#140900 0%,#221400 50%,#140900 100%)",heroBg:"linear-gradient(180deg,#221400 0%,#140900 100%)",accent:"#f59e0b",accent2:"#fcd34d",cardBg:"#180c00",cardBorder:"#302000",nameCss:"linear-gradient(90deg,#f59e0b,#fcd34d)",radius:"14px",btnRadius:"14px",footerBg:"#f59e0b0d",avatarBorder:"#f59e0b44"},
  arctic:{bg:"linear-gradient(160deg,#010a14 0%,#041828 50%,#010a14 100%)",heroBg:"linear-gradient(180deg,#041828 0%,#010a14 100%)",accent:"#b8f0ff",accent2:"#7ad7f0",cardBg:"#030f1e",cardBorder:"#071e30",nameCss:"linear-gradient(90deg,#b8f0ff,#7ad7f0)",radius:"14px",btnRadius:"14px",footerBg:"#b8f0ff0d",avatarBorder:"#b8f0ff44"},
  teal:{bg:"linear-gradient(160deg,#00141a 0%,#002830 50%,#00141a 100%)",heroBg:"linear-gradient(180deg,#002830 0%,#00141a 100%)",accent:"#00d2d3",accent2:"#54a0ff",cardBg:"#001c22",cardBorder:"#003040",nameCss:"linear-gradient(90deg,#00d2d3,#54a0ff)",radius:"14px",btnRadius:"14px",footerBg:"#00d2d30d",avatarBorder:"#00d2d344"},
  navy:{bg:"linear-gradient(160deg,#050a14 0%,#0a1428 50%,#050a14 100%)",heroBg:"linear-gradient(180deg,#0a1428 0%,#050a14 100%)",accent:"#4fa3e8",accent2:"#90cdf4",cardBg:"#08101e",cardBorder:"#152040",nameCss:"linear-gradient(90deg,#4fa3e8,#90cdf4)",radius:"14px",btnRadius:"14px",footerBg:"#4fa3e80d",avatarBorder:"#4fa3e844"},
  indigo:{bg:"linear-gradient(160deg,#06011e 0%,#0f0438 50%,#06011e 100%)",heroBg:"linear-gradient(180deg,#0f0438 0%,#06011e 100%)",accent:"#6366f1",accent2:"#a5b4fc",cardBg:"#0a0228",cardBorder:"#1a0a48",nameCss:"linear-gradient(90deg,#6366f1,#a5b4fc)",radius:"14px",btnRadius:"14px",footerBg:"#6366f10d",avatarBorder:"#6366f144"},
  slate:{bg:"#0f172a",heroBg:"linear-gradient(180deg,#1e293b 0%,#0f172a 100%)",accent:"#94a3b8",accent2:"#cbd5e1",cardBg:"#1e293b",cardBorder:"#334155",nameCss:"linear-gradient(90deg,#94a3b8,#cbd5e1)",radius:"10px",btnRadius:"10px",footerBg:"#94a3b80d",avatarBorder:"#94a3b844"},
  violet:{bg:"linear-gradient(160deg,#0a0018 0%,#140030 50%,#0a0018 100%)",heroBg:"linear-gradient(180deg,#140030 0%,#0a0018 100%)",accent:"#8b5cf6",accent2:"#c4b5fd",cardBg:"#0e0022",cardBorder:"#200044",nameCss:"linear-gradient(90deg,#8b5cf6,#c4b5fd)",radius:"14px",btnRadius:"14px",footerBg:"#8b5cf60d",avatarBorder:"#8b5cf644"},
  fire:{bg:"linear-gradient(160deg,#1a0500 0%,#2a0a00 50%,#1a0500 100%)",heroBg:"linear-gradient(180deg,#2a0a00 0%,#1a0500 100%)",accent:"#ff4400",accent2:"#ff9900",cardBg:"#1e0600",cardBorder:"#3a1000",nameCss:"linear-gradient(90deg,#ff4400,#ff9900)",radius:"14px",btnRadius:"14px",footerBg:"#ff44000d",avatarBorder:"#ff440044"},
  crimson:{bg:"linear-gradient(160deg,#140005 0%,#220008 50%,#140005 100%)",heroBg:"linear-gradient(180deg,#220008 0%,#140005 100%)",accent:"#e63946",accent2:"#ff758f",cardBg:"#180005",cardBorder:"#320010",nameCss:"linear-gradient(90deg,#e63946,#ff758f)",radius:"14px",btnRadius:"14px",footerBg:"#e639460d",avatarBorder:"#e6394644"},
  burgundy:{bg:"linear-gradient(160deg,#0d0000 0%,#1e0505 50%,#0d0000 100%)",heroBg:"linear-gradient(180deg,#1e0505 0%,#0d0000 100%)",accent:"#c41e3a",accent2:"#e85d75",cardBg:"#140404",cardBorder:"#2a0808",nameCss:"linear-gradient(90deg,#c41e3a,#e85d75)",radius:"14px",btnRadius:"14px",footerBg:"#8000200d",avatarBorder:"#80002044"},
  coral:{bg:"linear-gradient(160deg,#1a0808 0%,#2a1010 50%,#1a0808 100%)",heroBg:"linear-gradient(180deg,#2a1010 0%,#1a0808 100%)",accent:"#ff6b6b",accent2:"#ffa07a",cardBg:"#1e0c0c",cardBorder:"#3a1818",nameCss:"linear-gradient(90deg,#ff6b6b,#ffa07a)",radius:"14px",btnRadius:"14px",footerBg:"#ff6b6b0d",avatarBorder:"#ff6b6b44"},
  rose:{bg:"linear-gradient(160deg,#1a0a10 0%,#2a1020 50%,#1a0812 100%)",heroBg:"linear-gradient(180deg,#2a1020 0%,#1a0a10 100%)",accent:"#f4a0b5",accent2:"#e0607e",cardBg:"#1e0c14",cardBorder:"#3a1a28",nameCss:"linear-gradient(90deg,#f4a0b5,#e0607e)",radius:"14px",btnRadius:"14px",footerBg:"#f4a0b50d",avatarBorder:"#f4a0b544"},
  pearl:{bg:"#f8f8f5",heroBg:"linear-gradient(180deg,#ffffff 0%,#f0f0ea 100%)",accent:"#8a7560",accent2:"#c4a882",cardBg:"#ffffff",cardBorder:"#e8e4de",nameCss:"linear-gradient(90deg,#8a7560,#c4a882)",radius:"14px",btnRadius:"14px",footerBg:"#8a75600d",avatarBorder:"#8a756044",light:true},
  ice:{bg:"#f0f8ff",heroBg:"linear-gradient(180deg,#ffffff 0%,#e8f4fd 100%)",accent:"#0077b6",accent2:"#0096c7",cardBg:"#ffffff",cardBorder:"#cce8f4",nameCss:"linear-gradient(90deg,#0077b6,#0096c7)",radius:"14px",btnRadius:"14px",footerBg:"#0077b60d",avatarBorder:"#0077b644",light:true},
  mint:{bg:"#f5fffc",heroBg:"linear-gradient(180deg,#ffffff 0%,#e8fff7 100%)",accent:"#10b981",accent2:"#059669",cardBg:"#ffffff",cardBorder:"#d1fae5",nameCss:"linear-gradient(90deg,#10b981,#059669)",radius:"14px",btnRadius:"14px",footerBg:"#10b9810d",avatarBorder:"#10b98144",light:true},
  cream:{bg:"#fffef7",heroBg:"linear-gradient(180deg,#ffffff 0%,#f8f6e8 100%)",accent:"#8b6914",accent2:"#b5901e",cardBg:"#ffffff",cardBorder:"#f0ead8",nameCss:"linear-gradient(90deg,#8b6914,#b5901e)",radius:"14px",btnRadius:"14px",footerBg:"#8b69140d",avatarBorder:"#8b691444",light:true},
  blush:{bg:"#fff5f8",heroBg:"linear-gradient(180deg,#ffffff 0%,#ffe8f0 100%)",accent:"#e91e8c",accent2:"#ff6bb5",cardBg:"#ffffff",cardBorder:"#ffd0e8",nameCss:"linear-gradient(90deg,#e91e8c,#ff6bb5)",radius:"20px",btnRadius:"20px",footerBg:"#e91e8c0d",avatarBorder:"#e91e8c44",light:true},
  lavender:{bg:"#f8f5ff",heroBg:"linear-gradient(180deg,#ffffff 0%,#f0eaff 100%)",accent:"#7c3aed",accent2:"#a855f7",cardBg:"#ffffff",cardBorder:"#e8d8ff",nameCss:"linear-gradient(90deg,#7c3aed,#a855f7)",radius:"14px",btnRadius:"14px",footerBg:"#7c3aed0d",avatarBorder:"#7c3aed44",light:true},
}

function IconWhatsApp({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill={color}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.856L.054 23.25a.75.75 0 0 0 .916.921l5.487-1.455A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 0 1-4.953-1.354l-.355-.211-3.684.977.991-3.598-.232-.371A9.713 9.713 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>)}
function IconInstagram({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5" fill={color} stroke="none"/></svg>)}
function IconTikTok({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill={color}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/></svg>)}
function IconLinkedIn({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill={color}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>)}
function IconFacebook({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill={color}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>)}
function IconYouTube({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill={color}><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>)}
function IconEmail({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>)}
function IconGlobe({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>)}
function IconLink({color}:{color:string}){return(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>)}
function getCustomIcon(url:string):string{
  if(/wa\.me|whatsapp/i.test(url))return'whatsapp'
  if(/instagram/i.test(url))return'instagram'
  if(/tiktok/i.test(url))return'tiktok'
  if(/linkedin/i.test(url))return'linkedin'
  if(/facebook|fb\.com/i.test(url))return'facebook'
  if(/youtube|youtu\.be/i.test(url))return'youtube'
  if(/^mailto/i.test(url))return'email'
  return'link'
}
function BrandIcon({type,color}:{type:string;color:string}){
  if(type==='whatsapp')return<IconWhatsApp color={color}/>
  if(type==='instagram')return<IconInstagram color={color}/>
  if(type==='tiktok')return<IconTikTok color={color}/>
  if(type==='linkedin')return<IconLinkedIn color={color}/>
  if(type==='facebook')return<IconFacebook color={color}/>
  if(type==='youtube')return<IconYouTube color={color}/>
  if(type==='email')return<IconEmail color={color}/>
  if(type==='globe')return<IconGlobe color={color}/>
  return<IconLink color={color}/>
}


export default async function ProfilePage({params}:{params:Promise<{slug:string}>}){
  const {slug} = await params
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const {data:profile} = await supabase.from('nfc_profiles').select('*').eq('slug',slug).eq('is_active',true).single() as {data:NFCProfile|null}
  if(!profile)return(
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontFamily:'sans-serif',flexDirection:'column',gap:'12px'}}>
      <div style={{fontSize:'48px'}}>404</div>
      <div style={{color:'#666'}}>Perfil no encontrado</div>
    </div>
  )
  await supabase.from('nfc_profiles').update({views:(profile.views||0)+1}).eq('id',profile.id)
  const theme = T[profile.template]||T.default
  const isLight = !!theme.light
  const textColor = isLight?'#0d0d0d':'#f0f0f0'
  const subColor = isLight?'#555555':'#9ca3af'
  const mutedColor = isLight?'#888888':'#6b7280'
  const allLinks=[
    profile.whatsapp?{url:profile.whatsapp.startsWith('http')?profile.whatsapp:`https://wa.me/${profile.whatsapp.replace(/\D/g,'')}`,label:'WhatsApp',type:'whatsapp'}:null,
    profile.instagram?{url:profile.instagram.startsWith('http')?profile.instagram:`https://instagram.com/${profile.instagram.replace('@','')}`,label:'Instagram',type:'instagram'}:null,
    profile.tiktok?{url:profile.tiktok.startsWith('http')?profile.tiktok:`https://tiktok.com/@${profile.tiktok.replace('@','')}`,label:'TikTok',type:'tiktok'}:null,
    profile.linkedin?{url:profile.linkedin.startsWith('http')?profile.linkedin:`https://linkedin.com/in/${profile.linkedin}`,label:'LinkedIn',type:'linkedin'}:null,
    profile.facebook?{url:profile.facebook.startsWith('http')?profile.facebook:`https://facebook.com/${profile.facebook}`,label:'Facebook',type:'facebook'}:null,
    profile.youtube?{url:profile.youtube.startsWith('http')?profile.youtube:`https://youtube.com/@${profile.youtube.replace('@','')}`,label:'YouTube',type:'youtube'}:null,
    profile.email?{url:`mailto:${profile.email}`,label:'Email',type:'email'}:null,
    profile.website?{url:profile.website.startsWith('http')?profile.website:`https://${profile.website}`,label:'Sitio Web',type:'globe'}:null,
    ...(profile.custom_links||[]).map((l:CustomLink)=>({url:l.url,label:l.label,type:getCustomIcon(l.url)})),
  ].filter(Boolean) as {url:string;label:string;type:string}[]
  return(
    <div style={{minHeight:'100vh',background:theme.bg,fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <div style={{background:theme.heroBg,paddingBottom:'50px',position:'relative'}}>
          <div style={{height:'50px'}}/>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'0 20px'}}>
          {profile.avatar_url?(
            <img src={profile.avatar_url} alt={profile.display_name} style={{width:'110px',height:'110px',borderRadius:'50%',objectFit:'cover',border:`3px solid ${theme.avatarBorder}`,boxShadow:`0 0 20px ${theme.avatarBorder}`}}/>
          ):(
            <div style={{width:'110px',height:'110px',borderRadius:'50%',background:theme.cardBg,border:`3px solid ${theme.avatarBorder}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'40px',color:theme.accent}}>{profile.display_name?.charAt(0)||'T'}</div>
          )}
          <div style={{height:'16px'}}/>
          <h1 style={{margin:0,fontSize:'26px',fontWeight:700,letterSpacing:'-0.5px',...(theme.nameCss?{background:theme.nameCss,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}:{color:textColor})}}>{profile.display_name}</h1>
          {profile.tagline&&<p style={{margin:'6px 0 0',fontSize:'14px',color:theme.accent,fontWeight:500}}>{profile.tagline}</p>}
          {profile.company&&<p style={{margin:'4px 0 0',fontSize:'13px',color:subColor}}>{profile.company}</p>}
        </div>
      </div>
      <div style={{maxWidth:'420px',margin:'-20px auto 0',padding:'0 16px 40px',position:'relative',zIndex:1}}>
        {allLinks.length>0&&(
          <div style={{background:theme.cardBg,borderRadius:theme.radius,border:`1px solid ${theme.cardBorder}`,padding:'8px',display:'flex',flexDirection:'column',gap:'6px',marginBottom:'16px'}}>
            {allLinks.map((link,i)=>(
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:'14px',padding:'14px 16px',borderRadius:theme.btnRadius,background:`${theme.accent}11`,border:`1px solid ${theme.accent}22`,textDecoration:'none',transition:'all 0.2s'}}>
                <BrandIcon type={link.type} color={theme.accent}/>
                <span style={{color:textColor,fontSize:'15px',fontWeight:500}}>{link.label}</span>
              </a>
            ))}
          </div>
        )}
        <div style={{textAlign:'center',padding:'20px',background:theme.footerBg,borderRadius:theme.radius,border:`1px solid ${theme.cardBorder}`}}>
          <p style={{margin:0,fontSize:'11px',color:mutedColor,letterSpacing:'0.5px',textTransform:'uppercase'}}>Powered by</p>
          <p style={{margin:'4px 0 0',fontSize:'16px',fontWeight:700,color:theme.accent,letterSpacing:'1px'}}>TAPLY</p>
        </div>
      </div>
    </div>
  )
}
