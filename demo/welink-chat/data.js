/* ============================================================
 * 群聊界面演示数据（demo only）
 *
 * 这不是 GAME-DATA-001 冻结的数据契约，只是界面原型用的样例。
 * 结构刻意贴近契约草案，方便之后拆开：
 *   pack : id / display_name / tier / base_rate / rarity_table / members[]
 *          member: id / alias / avatar_seed / source_group / rarity / tags[] / skill / quote
 *   ui   : 纯展示数据（未读数、免打扰、消息流），将来不进存档契约
 * 群友全部化名 + avatar_seed，对齐 GAME_DESIGN.md D1。
 * ============================================================ */
window.HVV_DEMO_PACKS = [
  {
    pack: {
      id: 'grp_night_ink',
      display_name: '深夜画图交流群',
      tier: 2,
      base_rate: 3.2,
      rarity_table: { N: 0.6, R: 0.28, SR: 0.1, SSR: 0.02 },
      members: [
        {
          id: 'gm_aqi', alias: '阿七', avatar_seed: 'aqi-7', source_group: 'grp_night_ink',
          rarity: 'SR', tags: ['深夜在线', '画图', '甲方受害者'],
          skill: { kind: 'rate_boost', value: 0.12 }, quote: '这个稿子我今晚一定能交'
        },
        {
          id: 'gm_laok', alias: '老K', avatar_seed: 'laok-01', source_group: 'grp_night_ink',
          rarity: 'SSR', tags: ['斗图', '深夜在线', '资源帝'],
          skill: { kind: 'flat_bonus', value: 8 }, quote: '来，看看这个表情包'
        },
        {
          id: 'gm_youzi', alias: '柚子茶', avatar_seed: 'youzi-tea', source_group: 'grp_night_ink',
          rarity: 'R', tags: ['潜水', '偶尔冒泡'],
          skill: { kind: 'idle_boost', value: 0.05 }, quote: '冒个泡，继续潜水'
        },
        {
          id: 'gm_jianpan', alias: '键盘侠', avatar_seed: 'kb-man', source_group: 'grp_night_ink',
          rarity: 'SR', tags: ['嘴强王者', '斗图'],
          skill: { kind: 'rate_boost', value: 0.08 }, quote: '这图我三秒就能 P 出来'
        },
        {
          id: 'gm_bantang', alias: '半糖', avatar_seed: 'half-sugar', source_group: 'grp_night_ink',
          rarity: 'N', tags: ['新人'],
          skill: { kind: 'flat_bonus', value: 2 }, quote: '大家好，我是新来的'
        }
      ]
    },
    ui: {
      unread: 3, muted: false, pinned: true, updated: '09:31',
      notice: '本群禁止发未打码的甲方需求截图；线稿统一传到群文件，文件名带日期。',
      files: [
        { name: '线稿_v3_深夜版.psd', size: '86.4 MB', by: '阿七', time: '今天 09:12' },
        { name: '配色参考_2026.zip', size: '12.1 MB', by: '老K', time: '昨天 23:50' }
      ],
      replies: ['这个改法我试试', '甲方看了会沉默', '我先存一份备份', '等我十分钟，马上回来', '这条我先截图了 😂', '比例我调了，你再看看'],
      messages: [
        { id: 'a1', day: '昨天', time: '23:41', type: 'system', text: '「老K」邀请「半糖」加入了群聊' },
        { id: 'a2', day: '昨天', time: '23:42', from: 'gm_laok', text: '新人来了，先看图还是先看梗？' },
        { id: 'a3', day: '昨天', time: '23:43', from: 'gm_bantang', text: '我都可以，主要是来学画图的 🙌' },
        { id: 'a4', day: '今天', time: '09:05', type: 'notice', title: '群公告', text: '本群禁止发未打码的甲方需求截图；线稿统一传到群文件。' },
        { id: 'a5', day: '今天', time: '09:12', from: 'gm_aqi', text: '昨晚那版线稿我重画了，看看这个角度行不行' },
        { id: 'a6', day: '今天', time: '09:12', from: 'gm_aqi', type: 'file', name: '线稿_v3_深夜版.psd', size: '86.4 MB' },
        { id: 'a7', day: '今天', time: '09:15', from: 'gm_jianpan', quote: { from: '阿七', text: '看看这个角度行不行' }, text: '角度没问题，就是左边那条腿长了 5 厘米。' },
        { id: 'a8', day: '今天', time: '09:16', from: 'gm_laok', type: 'sticker', emoji: '🫠' },
        { id: 'a9', day: '今天', time: '09:20', from: 'me', text: '同意键盘侠，比例再压一点。' },
        { id: 'a10', day: '今天', time: '09:24', from: 'gm_youzi', text: '冒个泡，继续潜水。' },
        { id: 'a11', day: '今天', time: '09:31', from: 'gm_aqi', type: 'meeting', title: '今晚赶稿碰头（语音）', when: '今天 22:30 - 23:00', code: '862 431 220' }
      ]
    }
  },

  {
    pack: {
      id: 'grp_weekend_raid',
      display_name: '周末开黑群',
      tier: 1,
      base_rate: 5.0,
      rarity_table: { N: 0.55, R: 0.3, SR: 0.12, SSR: 0.03 },
      members: [
        {
          id: 'gm_daxiong', alias: '大熊', avatar_seed: 'big-bear', source_group: 'grp_weekend_raid',
          rarity: 'SSR', tags: ['指挥', '开麦'], skill: { kind: 'flat_bonus', value: 10 },
          quote: '听我指挥，别乱冲'
        },
        {
          id: 'gm_maobing', alias: '猫饼', avatar_seed: 'cat-bing', source_group: 'grp_weekend_raid',
          rarity: 'SR', tags: ['斗图', '开麦'], skill: { kind: 'rate_boost', value: 0.1 },
          quote: '先来一局，输赢无所谓'
        },
        {
          id: 'gm_zhoumo', alias: '周末战士', avatar_seed: 'weekend-war', source_group: 'grp_weekend_raid',
          rarity: 'R', tags: ['只在周末出现'], skill: { kind: 'idle_boost', value: 0.06 },
          quote: '工作日别叫我'
        },
        {
          id: 'gm_tangdou', alias: '糖豆', avatar_seed: 'sugar-bean', source_group: 'grp_weekend_raid',
          rarity: 'R', tags: ['气氛组'], skill: { kind: 'flat_bonus', value: 4 },
          quote: '我负责喊加油'
        },
        {
          id: 'gm_xiaoqiang', alias: '小强', avatar_seed: 'xq-01', source_group: 'grp_weekend_raid',
          rarity: 'N', tags: ['新人', '手速快'], skill: { kind: 'flat_bonus', value: 3 },
          quote: '带我一个'
        }
      ]
    },
    ui: {
      unread: 12, muted: false, pinned: false, updated: '10:02',
      notice: '周六 20:00 固定开黑，缺人提前一小时在群里喊。',
      files: [{ name: '战术板_简版.png', size: '2.4 MB', by: '大熊', time: '今天 10:00' }],
      replies: ['上车！', '我五分钟后到', '这波能赢', '谁开麦？', '别急着开，等我喝口水', '又是我背锅是吧'],
      messages: [
        { id: 'b1', day: '今天', time: '09:48', type: 'system', text: '「大熊」修改群名为「周末开黑群」' },
        { id: 'b2', day: '今天', time: '09:50', from: 'gm_daxiong', text: '今晚 20:00，老规矩，缺两个位置。' },
        { id: 'b3', day: '今天', time: '09:52', from: 'gm_xiaoqiang', text: '带我一个，我手速快。' },
        { id: 'b4', day: '今天', time: '09:53', from: 'gm_maobing', type: 'sticker', emoji: '🐱' },
        { id: 'b5', day: '今天', time: '09:58', from: 'me', text: '我 20:30 到家，先占个位。' },
        { id: 'b6', day: '今天', time: '10:00', from: 'gm_daxiong', type: 'file', name: '战术板_简版.png', size: '2.4 MB' },
        { id: 'b7', day: '今天', time: '10:02', from: 'gm_tangdou', text: '我负责喊加油 🎉' }
      ]
    }
  },

  {
    pack: {
      id: 'grp_morning_eight',
      display_name: '早八人互助会',
      tier: 3,
      base_rate: 1.8,
      rarity_table: { N: 0.5, R: 0.32, SR: 0.15, SSR: 0.03 },
      members: [
        {
          id: 'gm_naozhong', alias: '闹钟精', avatar_seed: 'clock-spirit', source_group: 'grp_morning_eight',
          rarity: 'SSR', tags: ['清晨在线', '打卡'], skill: { kind: 'flat_bonus', value: 9 },
          quote: '六点半的闹钟，我按了七次'
        },
        {
          id: 'gm_kafeiyin', alias: '咖啡因', avatar_seed: 'caffeine', source_group: 'grp_morning_eight',
          rarity: 'R', tags: ['续命', '深夜在线'], skill: { kind: 'idle_boost', value: 0.07 },
          quote: '今天第三杯了'
        },
        {
          id: 'gm_zhouyi', alias: '周一恐惧症', avatar_seed: 'monday-fear', source_group: 'grp_morning_eight',
          rarity: 'SR', tags: ['嘴强王者', '潜水'], skill: { kind: 'rate_boost', value: 0.09 },
          quote: '还有五天就周末了'
        },
        {
          id: 'gm_wuxiu', alias: '午休战神', avatar_seed: 'nap-god', source_group: 'grp_morning_eight',
          rarity: 'N', tags: ['午休出现'], skill: { kind: 'flat_bonus', value: 2 },
          quote: '午休时间不要叫我'
        }
      ]
    },
    ui: {
      unread: 0, muted: true, pinned: false, updated: '昨天',
      notice: '打卡请用固定格式：序号 + 起床时间。互不打扰，各睡各的。',
      files: [],
      replies: ['已打卡，第 12 天', '今天又迟到了三分钟', '我定了五个闹钟', '喝口咖啡继续', '明天一定早起（第 30 次）'],
      messages: [
        { id: 'c1', day: '昨天', time: '07:02', type: 'system', text: '「闹钟精」创建了群聊' },
        { id: 'c2', day: '昨天', time: '07:05', from: 'gm_naozhong', text: '01 06:40 已打卡。' },
        { id: 'c3', day: '昨天', time: '07:31', from: 'gm_kafeiyin', text: '02 07:28，差一点。' },
        { id: 'c4', day: '昨天', time: '08:02', from: 'gm_zhouyi', text: '03 07:59，险胜。' },
        { id: 'c5', day: '昨天', time: '08:03', from: 'gm_wuxiu', type: 'sticker', emoji: '😴' },
        { id: 'c6', day: '昨天', time: '12:10', from: 'me', text: '今天午休睡过头了，直接错过打卡。' }
      ]
    }
  }
];
