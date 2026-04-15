import { neon } from "@neondatabase/serverless";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function getDatabaseUrl() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const envPath = resolve(process.cwd(), file);
    if (existsSync(envPath)) {
      const envRaw = readFileSync(envPath, "utf8");
      const lines = envRaw.split("\n");
      for (const line of lines) {
        if (line.trim() && !line.startsWith("#")) {
          const idx = line.indexOf("=");
          if (idx !== -1) {
            const key = line.slice(0, idx).trim();
            const value = line.slice(idx + 1).trim();
            if (key === "PLAYER_DATABASE_URL") return value;
          }
        }
      }
    }
  }
  return null;
}

const url = getDatabaseUrl();
if (!url) {
  console.error("❌ PLAYER_DATABASE_URL not found in .env or .env.local");
  process.exit(1);
}

const sql = neon(url);

const seedPlayers = [
  {
    playerId: 1000,
    displayName: "Abdullah Shafique",
    teamCode: "LQ",
    role: "BAT",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c5/2_14_Shafique_mugshot.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1001,
    displayName: "Fakhar Zaman",
    teamCode: "LQ",
    role: "BAT",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Fakhar_Zaman%2C_Pakistan_vs_Sri_Lanka%2C_1st_ODI%2C_2017.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1002,
    displayName: "Asif Ali",
    teamCode: "LQ",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Asif+Ali&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1003,
    displayName: "Tayyab Tahir",
    teamCode: "LQ",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Tayyab+Tahir&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1004,
    displayName: "Parvez Hossain Emon",
    teamCode: "LQ",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Parvez+Hossain+Emon&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1005,
    displayName: "Haseebullah Khan",
    teamCode: "LQ",
    role: "WK",
    imageUrl: "https://ui-avatars.com/api/?name=Haseebullah+Khan&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1006,
    displayName: "Rubin Hermann",
    teamCode: "LQ",
    role: "WK",
    imageUrl: "https://ui-avatars.com/api/?name=Rubin+Hermann&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1007,
    displayName: "Sikandar Raza",
    teamCode: "LQ",
    role: "AR",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Sikandar_Raza_2022.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1008,
    displayName: "Dunith Wellalage",
    teamCode: "LQ",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Dunith+Wellalage&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1009,
    displayName: "Daniel Sams",
    teamCode: "LQ",
    role: "AR",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Daniel_Sams_Batting.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1010,
    displayName: "Shaheen Afridi",
    teamCode: "LQ",
    role: "BOWL",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/78/Shaheen_Afridi_%282%29.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1011,
    displayName: "Haris Rauf",
    teamCode: "LQ",
    role: "BOWL",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/36/1_53_Haris_Rauf.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1012,
    displayName: "Mustafizur Rahman",
    teamCode: "LQ",
    role: "BOWL",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Mustafizur_Rahman_%284%29_%28cropped%29.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1013,
    displayName: "Usama Mir",
    teamCode: "LQ",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Usama+Mir&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1014,
    displayName: "Maaz Khan",
    teamCode: "LQ",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Maaz+Khan&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1015,
    displayName: "David Warner",
    teamCode: "KK",
    role: "BAT",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2c/DAVID_WARNER_%2811704782453%29.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1016,
    displayName: "Aqib Ilyas",
    teamCode: "KK",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Aqib+Ilyas&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1017,
    displayName: "Muhammad Waseem",
    teamCode: "KK",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Muhammad+Waseem&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1018,
    displayName: "Reeza Hendricks",
    teamCode: "KK",
    role: "BAT",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/37/REEZA_HENDRICKS_%2815519916117%29.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1019,
    displayName: "Johnson Charles",
    teamCode: "KK",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Johnson+Charles&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1020,
    displayName: "Saad Baig",
    teamCode: "KK",
    role: "WK",
    imageUrl: "https://ui-avatars.com/api/?name=Saad+Baig&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1021,
    displayName: "Azam Khan",
    teamCode: "KK",
    role: "WK",
    imageUrl: "https://ui-avatars.com/api/?name=Azam+Khan&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1022,
    displayName: "Moeen Ali",
    teamCode: "KK",
    role: "AR",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d1/2018.01.06.17.47.32-Moeen_Ali_%2838876905344%29_%28cropped%29.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1023,
    displayName: "Khushdil Shah",
    teamCode: "KK",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Khushdil+Shah&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1024,
    displayName: "Salman Ali Agha",
    teamCode: "KK",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Salman+Ali+Agha&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1025,
    displayName: "Hasan Ali",
    teamCode: "KK",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Hasan+Ali&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1026,
    displayName: "Abbas Afridi",
    teamCode: "KK",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Abbas+Afridi&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1027,
    displayName: "Mir Hamza",
    teamCode: "KK",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Mir+Hamza&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1028,
    displayName: "Adam Zampa",
    teamCode: "KK",
    role: "BOWL",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/51/Adam_Zampa_2023.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1029,
    displayName: "Ihsanullah",
    teamCode: "KK",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Ihsanullah&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1030,
    displayName: "Mark Chapman",
    teamCode: "IU",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Mark+Chapman&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1031,
    displayName: "Sameer Minhas",
    teamCode: "IU",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Sameer+Minhas&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1032,
    displayName: "Haider Ali",
    teamCode: "IU",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Haider+Ali&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1033,
    displayName: "Mohammad Faiq",
    teamCode: "IU",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Mohammad+Faiq&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1034,
    displayName: "Mohsin Riaz",
    teamCode: "IU",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Mohsin+Riaz&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1035,
    displayName: "Devon Conway",
    teamCode: "IU",
    role: "WK",
    imageUrl: "https://ui-avatars.com/api/?name=Devon+Conway&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1036,
    displayName: "Andries Gous",
    teamCode: "IU",
    role: "WK",
    imageUrl: "https://ui-avatars.com/api/?name=Andries+Gous&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1037,
    displayName: "Shadab Khan",
    teamCode: "IU",
    role: "AR",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Shadab_Khan.png",
    active: true,
    metadata: {}
  },
  {
    playerId: 1038,
    displayName: "Faheem Ashraf",
    teamCode: "IU",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Faheem+Ashraf&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1039,
    displayName: "Imad Wasim",
    teamCode: "IU",
    role: "AR",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Imad_Wasim_1.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1040,
    displayName: "Richard Gleeson",
    teamCode: "IU",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Richard+Gleeson&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1041,
    displayName: "Mohammad Hasnain",
    teamCode: "IU",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Mohammad+Hasnain&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1042,
    displayName: "Salman Mirza",
    teamCode: "IU",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Salman+Mirza&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1043,
    displayName: "Nisar Ahmad",
    teamCode: "IU",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Nisar+Ahmad&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1044,
    displayName: "Salman Irshad",
    teamCode: "IU",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Salman+Irshad&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1045,
    displayName: "Steve Smith",
    teamCode: "MS",
    role: "BAT",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/STEVE_SMITH_%2811705303043%29.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1046,
    displayName: "Sahibzada Farhan",
    teamCode: "MS",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Sahibzada+Farhan&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1047,
    displayName: "Ashton Turner",
    teamCode: "MS",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Ashton+Turner&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1048,
    displayName: "Shan Masood",
    teamCode: "MS",
    role: "BAT",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/67/1_26_Shan_Masood.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1049,
    displayName: "Muhammad Awais Zafar",
    teamCode: "MS",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Muhammad+Awais+Zafar&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1050,
    displayName: "Lachlan Shaw",
    teamCode: "MS",
    role: "WK",
    imageUrl: "https://ui-avatars.com/api/?name=Lachlan+Shaw&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1051,
    displayName: "Josh Philippe",
    teamCode: "MS",
    role: "WK",
    imageUrl: "https://ui-avatars.com/api/?name=Josh+Philippe&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1052,
    displayName: "Mohammad Nawaz",
    teamCode: "MS",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Mohammad+Nawaz&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1053,
    displayName: "Mohammad Shehzad",
    teamCode: "MS",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Mohammad+Shehzad&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1054,
    displayName: "Mohammad Imran Randhawa",
    teamCode: "MS",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Mohammad+Imran+Randhawa&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1055,
    displayName: "Peter Siddle",
    teamCode: "MS",
    role: "BOWL",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ca/2_19_Peter_Siddle.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1056,
    displayName: "Arshad Iqbal",
    teamCode: "MS",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Arshad+Iqbal&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1057,
    displayName: "Tabraiz Shamsi",
    teamCode: "MS",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Tabraiz+Shamsi&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1058,
    displayName: "Momin Qamar",
    teamCode: "MS",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Momin+Qamar&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1059,
    displayName: "Mohammad Wasim Jr.",
    teamCode: "MS",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Mohammad+Wasim+Jr.&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1060,
    displayName: "Babar Azam",
    teamCode: "PZ",
    role: "BAT",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/43/Babar_azam_2023.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1061,
    displayName: "Abdul Samad",
    teamCode: "PZ",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Abdul+Samad&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1062,
    displayName: "James Vince",
    teamCode: "PZ",
    role: "BAT",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/88/James_Vince_2023.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1063,
    displayName: "Mirza Tahir Baig",
    teamCode: "PZ",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Mirza+Tahir+Baig&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1064,
    displayName: "Tanzid Hasan",
    teamCode: "PZ",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Tanzid+Hasan&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1065,
    displayName: "Mohammad Haris",
    teamCode: "PZ",
    role: "WK",
    imageUrl: "https://ui-avatars.com/api/?name=Mohammad+Haris&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1066,
    displayName: "Kusal Mendis",
    teamCode: "PZ",
    role: "WK",
    imageUrl: "https://ui-avatars.com/api/?name=Kusal+Mendis&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1067,
    displayName: "Aaron Hardie",
    teamCode: "PZ",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Aaron+Hardie&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1068,
    displayName: "Michael Bracewell",
    teamCode: "PZ",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Michael+Bracewell&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1069,
    displayName: "Iftikhar Ahmed",
    teamCode: "PZ",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Iftikhar+Ahmed&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1070,
    displayName: "Sufiyan Muqeem",
    teamCode: "PZ",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Sufiyan+Muqeem&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1071,
    displayName: "Khurram Shahzad",
    teamCode: "PZ",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Khurram+Shahzad&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1072,
    displayName: "Shahnawaz Dahani",
    teamCode: "PZ",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Shahnawaz+Dahani&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1073,
    displayName: "Shoriful Islam",
    teamCode: "PZ",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Shoriful+Islam&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1074,
    displayName: "Mohammad Basit",
    teamCode: "PZ",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Mohammad+Basit&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1075,
    displayName: "Rilee Rossouw",
    teamCode: "QG",
    role: "BAT",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/16/RILEE_ROSSOUW_%2815706681502%29.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1076,
    displayName: "Saud Shakeel",
    teamCode: "QG",
    role: "BAT",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e9/1_37_Saud_Shakeel.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1077,
    displayName: "Ben McDermott",
    teamCode: "QG",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Ben+McDermott&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1078,
    displayName: "Hassan Nawaz",
    teamCode: "QG",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Hassan+Nawaz&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1079,
    displayName: "Ahsan Ali",
    teamCode: "QG",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Ahsan+Ali&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1080,
    displayName: "Bismillah Khan",
    teamCode: "QG",
    role: "WK",
    imageUrl: "https://ui-avatars.com/api/?name=Bismillah+Khan&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1081,
    displayName: "Sam Harper",
    teamCode: "QG",
    role: "WK",
    imageUrl: "https://ui-avatars.com/api/?name=Sam+Harper&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1082,
    displayName: "Tom Curran",
    teamCode: "QG",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Tom+Curran&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1083,
    displayName: "Jahandad Khan",
    teamCode: "QG",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Jahandad+Khan&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1084,
    displayName: "Brett Hampton",
    teamCode: "QG",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Brett+Hampton&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1085,
    displayName: "Abrar Ahmed",
    teamCode: "QG",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Abrar+Ahmed&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1086,
    displayName: "Waseem Akram Jr.",
    teamCode: "QG",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Waseem+Akram+Jr.&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1087,
    displayName: "Ahmed Daniyal",
    teamCode: "QG",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Ahmed+Daniyal&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1088,
    displayName: "Alzarri Joseph",
    teamCode: "QG",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Alzarri+Joseph&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1089,
    displayName: "Usman Tariq",
    teamCode: "QG",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Usman+Tariq&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1090,
    displayName: "Marnus Labuschagne",
    teamCode: "HYD",
    role: "BAT",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4a/20251224_Marnus_Labuschagne_02.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1091,
    displayName: "Irfan Khan Niazi",
    teamCode: "HYD",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Irfan+Khan+Niazi&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1092,
    displayName: "Shayan Jahangir",
    teamCode: "HYD",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Shayan+Jahangir&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1093,
    displayName: "Sharjeel Khan",
    teamCode: "HYD",
    role: "BAT",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/43/Sharjeel_Khan.png",
    active: true,
    metadata: {}
  },
  {
    playerId: 1094,
    displayName: "Saad Ali",
    teamCode: "HYD",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Saad+Ali&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1095,
    displayName: "Kusal Perera",
    teamCode: "HYD",
    role: "WK",
    imageUrl: "https://ui-avatars.com/api/?name=Kusal+Perera&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1096,
    displayName: "Usman Khan",
    teamCode: "HYD",
    role: "WK",
    imageUrl: "https://ui-avatars.com/api/?name=Usman+Khan&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1097,
    displayName: "Glenn Maxwell",
    teamCode: "HYD",
    role: "AR",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Glen_Maxwell_2026_%28cropped%29.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1098,
    displayName: "Saim Ayub",
    teamCode: "HYD",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Saim+Ayub&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1099,
    displayName: "Hammad Azam",
    teamCode: "HYD",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Hammad+Azam&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1100,
    displayName: "Akif Javed",
    teamCode: "HYD",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Akif+Javed&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1101,
    displayName: "Mohammad Ali",
    teamCode: "HYD",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Mohammad+Ali&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1102,
    displayName: "Riley Meredith",
    teamCode: "HYD",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Riley+Meredith&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1103,
    displayName: "Maheesh Theekshana",
    teamCode: "HYD",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Maheesh+Theekshana&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1104,
    displayName: "Asif Mehmood",
    teamCode: "HYD",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Asif+Mehmood&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1105,
    displayName: "Yasir Khan",
    teamCode: "RWP",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Yasir+Khan&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1106,
    displayName: "Abdullah Fazal",
    teamCode: "RWP",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Abdullah+Fazal&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1107,
    displayName: "Shahzaib Khan",
    teamCode: "RWP",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Shahzaib+Khan&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1108,
    displayName: "Usman Khawaja",
    teamCode: "RWP",
    role: "BAT",
    imageUrl: "https://ui-avatars.com/api/?name=Usman+Khawaja&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1109,
    displayName: "Mohammad Rizwan",
    teamCode: "RWP",
    role: "WK",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/af/M_Rizwan.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1110,
    displayName: "Sam Billings",
    teamCode: "RWP",
    role: "WK",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/29/Sam_Billings_Kent_V_Surrey_2015_at_Kia_Oval_Cricket_Ground_%2827190750944%29.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1111,
    displayName: "Daryl Mitchell",
    teamCode: "RWP",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Daryl+Mitchell&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1112,
    displayName: "Asif Afridi",
    teamCode: "RWP",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Asif+Afridi&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1113,
    displayName: "Cole McConchie",
    teamCode: "RWP",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Cole+McConchie&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1114,
    displayName: "Kamran Ghulam",
    teamCode: "RWP",
    role: "AR",
    imageUrl: "https://ui-avatars.com/api/?name=Kamran+Ghulam&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1115,
    displayName: "Naseem Shah",
    teamCode: "RWP",
    role: "BOWL",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Naseem-Shah_%28cropped%29.png",
    active: true,
    metadata: {}
  },
  {
    playerId: 1116,
    displayName: "Mohammad Amir",
    teamCode: "RWP",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Mohammad+Amir&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1117,
    displayName: "Rishad Hossain",
    teamCode: "RWP",
    role: "BOWL",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/84/Rishad_Hossain%2C_2025-02-08_Fortune_Barishal_BPL_2025_Champions_Trophy_Presentation_Dhaka_%28PID-0003668%29_%28cropped%29.jpg",
    active: true,
    metadata: {}
  },
  {
    playerId: 1118,
    displayName: "Mohammad Amir Khan",
    teamCode: "RWP",
    role: "BOWL",
    imageUrl: "https://ui-avatars.com/api/?name=Mohammad+Amir+Khan&size=320&background=f3f4f6&color=111827&bold=true",
    active: true,
    metadata: {}
  },
  {
    playerId: 1119,
    displayName: "Ben Sears",
    teamCode: "RWP",
    role: "BOWL",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c4/2_10_Ben_Sears_%28cropped%29.jpg",
    active: true,
    metadata: {}
  }
];

async function seed() {
  console.log("Cleaning and seeding players into app.players...\n");

  console.log("Removing all current entries from app.players...");
  await sql`DELETE FROM app.players`;
  console.log("✓ All entries removed.\n");

  console.log(`Inserting ${seedPlayers.length} new players...`);
  for (const player of seedPlayers) {
    await sql`
      INSERT INTO app.players (player_id, display_name, team_code, role, image_url, active, metadata)
      VALUES (${player.playerId}, ${player.displayName}, ${player.teamCode}, ${player.role}, ${player.imageUrl}, ${player.active}, ${JSON.stringify(player.metadata)})
    `;
    console.log(`  ✓ [${player.playerId}] ${player.displayName}`);
  }

  const countResult = await sql`SELECT count(*) FROM app.players`;
  console.log(`\n✅ Seeding complete. Total players in table: ${countResult[0].count}`);
}

seed().catch((err) => {
  console.error("\n❌ Seed failed:", err.message);
  process.exit(1);
});
