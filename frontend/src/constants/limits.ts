/** MiniMax 网页版各输入框的字符上限（超出将无法提交） */

/** Styles 风格描述输入框上限 */
export const STYLES_LIMIT = 2000

/** Lyrics 歌词输入框上限 */
export const LYRICS_LIMIT = 3500

/**
 * MiniMax 音乐创作页（Music-3.0）官方入口。
 * - 国内主站：https://minimaxi.com/audio/music
 * - 海外站点：https://minimax.io/audio/music
 * 用户登录后将本页生成的 Styles/Lyrics 粘贴到对应输入框即可生成 mp3。
 *
 * 修改此处可一键切换主站/海外站；Electron 桌面态下优先走 system 浏览器。
 */
export const MINIMAX_MUSIC_URL = 'https://minimaxi.com/audio/music'
