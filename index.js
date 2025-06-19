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

new Vue({
    el: '#app',
    data: {
        cbxColor: false,
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
        selectedEmbedIndex: 0,
        webhookUrl: '',
        messageContent: '',
        username: '',
        avatarUrl: '',

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

    computed: {
        embed() {
            return this.embeds[this.selectedEmbedIndex];
        },
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

            return embedToPrint;
        },

        buildMessage: function() {
            const embeds = this.embeds.map((e) => this.sanitizeEmbed(e));
            const message = { embeds };
            if (this.messageContent) message.content = this.messageContent;
            if (this.username) message.username = this.username;
            if (this.avatarUrl) message.avatar_url = this.avatarUrl;
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
            fetch(this.webhookUrl, {
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

        updateColor: function () {
            this.cbxColor = true;
            if (this.isValidHexCode(this.embed.color)) {
                document.body.style.setProperty('--background-color', this.embed.color);
            } else {
                document.body.style.setProperty('--background-color', '#202225');
            }
        },

        clearColor: function () {
            this.$nextTick(() => {
                this.embed.color = '';
                document.body.style.setProperty('--background-color', '#202225');
            });
        },

        deleteField: function (index) {
            this.embed.fields.splice(index, 1);
        },

        addField: function () {
            this.embed.fields.push({
                name: '\u200b',
                value: '\u200b',
                inline: false,
            });
        },

        clearTimestamp: function (event) {
            this.$nextTick(() => {
                if (!event.target.checked) {
                    this.embed.timestamp = '';
                } else {
                    this.embed.timestamp = new Date();
                }
            });
        },

        clearEmbed: function () {
            for (let key of Object.keys(this.embed)) {
                let value = this.embed[key];
                if (typeof value == 'string') {
                    this.embed[key] = '';
                }
                this.clearColor();
                this.embed.author.name = '';
                this.embed.author.icon_url = '';
                this.embed.author.url = '';
                this.embed.thumbnail.url = '';
                this.embed.image.url = '';
                this.embed.footer.text = '';
                this.embed.footer.icon_url = '';
                this.embed.timestamp = null;
                this.embed.fields = [];
            }

            this.output = '';
        },

        hoverField: function (index) {
            document.querySelectorAll('.discord-embed .discord-embed-field')[index].classList.add('hovered');
        },

        blurField: function (index) {
            document.querySelectorAll('.discord-embed .discord-embed-field')[index].classList.remove('hovered');
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
            this.selectedEmbedIndex = this.embeds.length - 1;
        },

        removeEmbed: function (index) {
            if (this.embeds.length <= 1) return;
            this.embeds.splice(index, 1);
            if (this.selectedEmbedIndex >= this.embeds.length) {
                this.selectedEmbedIndex = this.embeds.length - 1;
            }
        },

        nextEmbed: function () {
            if (this.selectedEmbedIndex < this.embeds.length - 1) {
                this.selectedEmbedIndex++;
            }
        },

        prevEmbed: function () {
            if (this.selectedEmbedIndex > 0) {
                this.selectedEmbedIndex--;
            }
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

        // Added keyboard shortcut methods
        handleKeyDown: function (event) {
            if (event.ctrlKey && event.key.toLowerCase() === 'b') {
                event.preventDefault();
                this.wrapSelection('**');
            } else if (event.ctrlKey && event.key.toLowerCase() === 'i') {
                event.preventDefault();
                this.wrapSelection('*');
            } else if (event.ctrlKey && event.key.toLowerCase() === 'u') {
                event.preventDefault();
                this.wrapSelection('__');
            } else if (event.ctrlKey && event.key.toLowerCase() === 's') {
                event.preventDefault();
                this.wrapSelection('~~');
            } else if (event.ctrlKey && event.key === '`') {
                event.preventDefault();
                this.wrapSelection('`');
            }
            // Add more shortcuts as needed
        },

        wrapSelection: function (wrapper) {
            const textarea = this.$refs.descriptionInput;
            let start = textarea.selectionStart;
            let end = textarea.selectionEnd;
            let text = textarea.value;
            let selectedText = text.slice(start, end);
    
            // Check if the selection includes the wrapper at the start and end
            if (selectedText.startsWith(wrapper) && selectedText.endsWith(wrapper)) {
                // Remove wrapper from selection
                selectedText = selectedText.slice(wrapper.length, selectedText.length - wrapper.length);
                const newText = text.slice(0, start) + selectedText + text.slice(end);
                textarea.value = newText;
                this.embed.description = newText;
                // Update cursor positions
                textarea.selectionStart = start;
                textarea.selectionEnd = end - 2 * wrapper.length;
            } else if (
                text.slice(start - wrapper.length, start) === wrapper &&
                text.slice(end, end + wrapper.length) === wrapper
            ) {
                // Remove wrapper outside selection
                const newText =
                    text.slice(0, start - wrapper.length) +
                    selectedText +
                    text.slice(end + wrapper.length);
                textarea.value = newText;
                this.embed.description = newText;
                // Update cursor positions
                textarea.selectionStart = start - wrapper.length;
                textarea.selectionEnd = end - wrapper.length;
            } else {
                // Add wrapper
                const newText =
                    text.slice(0, start) + wrapper + selectedText + wrapper + text.slice(end);
                textarea.value = newText;
                this.embed.description = newText;
                // Update the cursor position
                textarea.selectionStart = start + wrapper.length;
                textarea.selectionEnd = end + wrapper.length;
            }
        },
    },

    created: function () {
        this.updateColor('#0099ff');
    },

    mounted: function () {
        // Add event listener for keyboard shortcuts
        const textarea = this.$refs.descriptionInput;
        if (textarea) {
            textarea.addEventListener('keydown', this.handleKeyDown);
        }
    },
});
