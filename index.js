/**
    Copyright (C) 2024 katerlol

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

Vue.component('component-form', {
    template: '#component-form-template',
    props: ['comp', 'parent'],
    computed: {
        uid() {
            return this._uid;
        },
        idx() {
            return this.parent.indexOf(this.comp);
        }
    },
    methods: {
        remove() {
            this.parent.splice(this.idx, 1);
        },
        addChild() {
            if (!this.comp.components) this.$set(this.comp, 'components', []);
            if (this.comp.components.length >= 40) return;
            this.comp.components.push({ type: 10, content: '', components: [] });
        }
    }
});

new Vue({
    el: '#app',
    data: {
        embeds: [
            {
                color: "#0099ff",
                title: 'This is the title',
                url: 'https://discord.js.org',
                author: {
                    name: 'Kater-Bot',
                    icon_url: 'https://katerlol.github.io/discord-embed-generator/img/katerbot-pfp.webp',
                    url: 'https://discord.js.org',
                },
                description: '*This* ~~is~~ the **description**',
                thumbnail: {
                    url: 'https://picsum.photos/200/200',
                },
                fields: [
                    {
                        name: 'Regular field Title',
                        value: 'Some value here',
                    },
                    {
                        name: '\u200b',
                        value: '\u200b',
                        inline: false,
                    },
                    {
                        name: 'Inline field title',
                        value: 'Some value here',
                        inline: true,
                    },
                    {
                        name: 'Inline field title',
                        value: 'Some value here',
                        inline: true,
                    },
                    {
                        name: 'Inline field title',
                        value: 'Some value here',
                        inline: true,
                    },
                ],
                image: {
                    url: 'https://picsum.photos/500/500',
                },
                timestamp: new Date(),
                footer: {
                    text: 'Some footer text here',
                    icon_url: 'https://katerlol.github.io/discord-embed-generator/img/katerbot-pfp.webp',
                },
            },
        ],
        webhookUrl: '',
        messageContent: '',
        username: '',
        avatarUrl: '',
        threadId: '',
        components: [],

        rules: [
            // Bold, italics, and paragraph rules
            [/^#### \s?(.*)$/gm, "<span class='d-h4'>$1</span>"],   // Heading 4
            [/^### \s?(.*)$/gm, "<span class='d-h3'>$1</span>"],    // Heading 3
            [/^## \s?(.*)$/gm, "<span class='d-h2'>$1</span>"],     // Heading 2
            [/^# \s?(.*)$/gm, "<span class='d-h1'>$1</span>"],      // Heading 1

            [/\*\*\*([^\*]+)\*\*\*/g, "<b><i>$1</i></b>"],          // Bold and Italic
            [/\*\*([^\*]+)\*\*/g, "<b>$1</b>"],                      // Bold
            [/\*([^*]+)\*/g, "<i>$1</i>"],                           // Italic
            [/__([^_]+)__/g, "<u>$1</u>"],                           // Underline
            [/~~([^~]+)~~/g, "<s>$1</s>"],                           // Strikethrough
            [/\|\|([^|]+)\|\|/g, "<span class='spoiler'>$1</span>"], // Spoiler
            [/`([^`]+)`/g, "<code>$1</code>"],                       // Inline Code
            [/```([\s\S]+?)```/g, "<pre><code>$1</code></pre>"],     // Code Block
            [/^> (.+)/gm, "<blockquote>$1</blockquote>"],            // Blockquote
            [/([^\n]+\n?)/g, "<p>$1</p>"],
        ],

        output: '',
    },

    components: {
        draggable: window['vuedraggable'],
    },


    methods: {
        fromMarkdown(str) {
            let preview = str;

            this.rules.forEach(([rule, template]) => {
                preview = preview.replace(rule, template);
            });

            return preview;
        },

        printTimestamp: function (timestamp) {
            return timestamp.toLocaleString();
        },

        // Checks if a string is a valid URL
        isValidURL: function (str) {
            var res = str.match(
                /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
            );
            return res !== null;
        },

        sanitizeEmbed: function(embed) {
            const embedToPrint = JSON.parse(JSON.stringify(embed));

            for (let i = 0; i < embedToPrint.fields.length; i++) {
                embedToPrint.fields[i].name = embedToPrint.fields[i].name
                    ? embedToPrint.fields[i].name.trim()
                    : '\u200b';
                embedToPrint.fields[i].value = embedToPrint.fields[i].value
                    ? embedToPrint.fields[i].value.trim()
                    : '\u200b';
            }

            for (let key of Object.keys(embedToPrint)) {
                const value = embedToPrint[key];
                if (value == null || value === '') {
                    delete embedToPrint[key];
                }
            }

            if (
                embedToPrint.author &&
                embedToPrint.author.name === '' &&
                embedToPrint.author.icon_url === '' &&
                embedToPrint.author.url === ''
            )
                delete embedToPrint.author;

            if (embedToPrint.thumbnail && embedToPrint.thumbnail.url === '')
                delete embedToPrint.thumbnail;

            if (embedToPrint.image && embedToPrint.image.url === '')
                delete embedToPrint.image;

            if (
                embedToPrint.footer &&
                embedToPrint.footer.text === '' &&
                embedToPrint.footer.icon_url === ''
            )
                delete embedToPrint.footer;

            if (typeof embedToPrint.color === 'string' && embedToPrint.color) {
                if (this.isValidHexCode(embedToPrint.color)) {
                    embedToPrint.color = parseInt(
                        embedToPrint.color.replace('#', ''),
                        16
                    );
                } else {
                    delete embedToPrint.color;
                }
            }

            return embedToPrint;
        },

        sanitizeComponent: function(comp) {
            const out = JSON.parse(JSON.stringify(comp));
            if ([1, 9, 17].includes(out.type)) {
                out.components = (out.components || [])
                    .map(c => this.sanitizeComponent(c))
                    .filter(c => Object.keys(c).length);
                if (!out.components.length) delete out.components;
            }
            if (out.type === 17 && out.accent_color) {
                if (this.isValidHexCode(out.accent_color)) {
                    out.accent_color = parseInt(out.accent_color.replace('#',''),16);
                } else {
                    delete out.accent_color;
                }
            }
            if (out.type === 2 && !out.disabled) delete out.disabled;
            for (let key of Object.keys(out)) {
                if (out[key] === '' || out[key] == null || (Array.isArray(out[key]) && !out[key].length)) {
                    delete out[key];
                }
            }
            return out;
        },

        buildMessage: function() {
            const embeds = this.embeds.map((e) => this.sanitizeEmbed(e));
            const message = { embeds };
            if (this.messageContent) message.content = this.messageContent;
            if (this.username) message.username = this.username;
            if (this.avatarUrl) message.avatar_url = this.avatarUrl;

            const comps = this.components
                .map(c => this.sanitizeComponent(c))
                .filter(c => Object.keys(c).length);
            if (comps.length) {
                message.components = comps;
                message.flags = 1 << 15;
            }
            return message;
        },

        toEmbedStr: function() {
            const message = this.buildMessage();
            this.output = JSON.stringify(message);
            return this.output;
        },

        sendWebhook: function() {
            if (!this.webhookUrl) {
                this.showToast('errorToast');
                return;
            }
            const payload = this.buildMessage();
            let url = this.webhookUrl;
            if (this.threadId) {
                url += (url.includes('?') ? '&' : '?') +
                    'thread_id=' + encodeURIComponent(this.threadId);
            }
            if (payload.components) {
                url += (url.includes('?') ? '&' : '?') + 'with_components=true';
            }
            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
                .then((res) => {
                    if (res.ok) {
                        this.showToast('successToast');
                    } else {
                        this.showToast('errorToast');
                    }
                })
                .catch(() => this.showToast('errorToast'));
        },

        isValidHexCode: function (hexCode) {
            return /^#[0-9A-F]{6}$/i.test(hexCode);
        },

        deleteField: function (embed, idx) {
            embed.fields.splice(idx, 1);
        },

        addField: function (embed) {
            embed.fields.push({
                name: '\u200b',
                value: '\u200b',
                inline: false,
            });
        },

        clearTimestamp: function (embed, event) {
            this.$nextTick(() => {
                if (!event.target.checked) {
                    embed.timestamp = '';
                } else {
                    embed.timestamp = new Date();
                }
            });
        },

        clearEmbed: function (embed) {
            for (let key of Object.keys(embed)) {
                let value = embed[key];
                if (typeof value == 'string') {
                    embed[key] = '';
                }
                embed.author.name = '';
                embed.author.icon_url = '';
                embed.author.url = '';
                embed.thumbnail.url = '';
                embed.image.url = '';
                embed.footer.text = '';
                embed.footer.icon_url = '';
                embed.timestamp = null;
                embed.fields = [];
            }

            this.output = '';
        },


        addEmbed: function () {
            if (this.embeds.length >= 10) return;
            this.embeds.push({
                color: '',
                title: '',
                url: '',
                author: { name: '', icon_url: '', url: '' },
                description: '',
                thumbnail: { url: '' },
                fields: [],
                image: { url: '' },
                timestamp: null,
                footer: { text: '', icon_url: '' },
            });
        },

        addComponent: function (target) {
            const list = target || this.components;
            if (list.length >= 40) return;
            list.push({ type: 10, content: '', components: [] });
        },

        deleteComponent: function(list, index) {
            list.splice(index, 1);
        },

        removeEmbed: function (index) {
            if (this.embeds.length <= 1) return;
            this.embeds.splice(index, 1);
        },

        clearAll: function () {
            this.embeds.forEach((e) => this.clearEmbed(e));
            this.components = [];
        },

        copyToClipboard: function () {
            if (this.output) {
                navigator.clipboard
                    .writeText(this.output)
                    .then(() => {
                        this.showToast('successToast');
                    })
                    .catch((err) => {
                        console.error('Failed to copy: ', err);
                        this.showToast('errorToast');
                    });
            } else {
                this.showToast('errorToast');
            }
        },

        copyCommandToClipboard: function () {
            if (this.output) {
                navigator.clipboard
                    .writeText(`!richembed post ${this.output}`)
                    .then(() => {
                        this.showToast('commandSuccessToast');
                    })
                    .catch((err) => {
                        console.error('Failed to copy: ', err);
                        this.showToast('errorToast');
                    });
            } else {
                this.showToast('errorToast');
            }
        },

        showToast(refName) {
            let toastEl = this.$refs[refName];
            let toast = new bootstrap.Toast(toastEl);
            toast.show();
        },
    },

    mounted: function () {},
});
