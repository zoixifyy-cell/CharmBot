import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
} from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('rolepanel')
        .setDescription('Create a button role panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Channel to send the panel in')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('title')
                .setDescription('Text shown above the image')
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('image')
                .setDescription('Direct image URL')
                .setRequired(true)
        )

        .addRoleOption(option =>
            option
                .setName('role1')
                .setDescription('First role')
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('label1')
                .setDescription('Button label for role 1')
                .setRequired(true)
        )

        .addRoleOption(option =>
            option
                .setName('role2')
                .setDescription('Second role')
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('label2')
                .setDescription('Button label for role 2')
                .setRequired(false)
        )

        .addRoleOption(option =>
            option
                .setName('role3')
                .setDescription('Third role')
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('label3')
                .setDescription('Button label for role 3')
                .setRequired(false)
        )

        .addRoleOption(option =>
            option
                .setName('role4')
                .setDescription('Fourth role')
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('label4')
                .setDescription('Button label for role 4')
                .setRequired(false)
        )

        .addRoleOption(option =>
            option
                .setName('role5')
                .setDescription('Fifth role')
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('label5')
                .setDescription('Button label for role 5')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        const channel =
            interaction.options.getChannel('channel');

        const title =
            interaction.options.getString('title');

        const imageUrl =
            interaction.options.getString('image');

        const guild = interaction.guild;

        const botMember =
            guild.members.me;

        if (
            !botMember.permissions.has(
                PermissionFlagsBits.ManageRoles
            )
        ) {
            return interaction.editReply(
                'Charm needs the **Manage Roles** permission.'
            );
        }

        const roles = [];

        for (let i = 1; i <= 5; i++) {
            const role =
                interaction.options.getRole(`role${i}`);

            const label =
                interaction.options.getString(`label${i}`);

            if (!role && !label) {
                continue;
            }

            if (!role || !label) {
                return interaction.editReply(
                    `Role ${i} needs both a role and a button label.`
                );
            }

            if (role.id === guild.id) {
                return interaction.editReply(
                    'You cannot use the @everyone role.'
                );
            }

            if (role.managed) {
                return interaction.editReply(
                    `**${role.name}** is managed by Discord or another integration and cannot be assigned.`
                );
            }

            if (
                role.position >=
                botMember.roles.highest.position
            ) {
                return interaction.editReply(
                    `Move Charm's role above **${role.name}** in Server Settings → Roles.`
                );
            }

            roles.push({
                role,
                label
            });
        }

        if (roles.length === 0) {
            return interaction.editReply(
                'You need at least one role.'
            );
        }

        // Download the image so the raw URL does not
        // appear above the image in Discord.
        let imageBuffer;
        let contentType;

        try {
            const response = await fetch(imageUrl);

            if (!response.ok) {
                return interaction.editReply(
                    'I could not download that image.'
                );
            }

            contentType =
                response.headers.get('content-type') || '';

            if (!contentType.startsWith('image/')) {
                return interaction.editReply(
                    'That URL does not appear to point directly to an image.'
                );
            }

            imageBuffer = Buffer.from(
                await response.arrayBuffer()
            );
        } catch (error) {
            console.error(
                'ROLE PANEL IMAGE ERROR:',
                error
            );

            return interaction.editReply(
                'I could not load that image URL.'
            );
        }

        let extension = 'png';

        if (contentType.includes('jpeg')) {
            extension = 'jpg';
        } else if (contentType.includes('gif')) {
            extension = 'gif';
        } else if (contentType.includes('webp')) {
            extension = 'webp';
        }

        const buttons = roles.map(item =>
            new ButtonBuilder()
                .setCustomId(
                    `charm_role_${item.role.id}`
                )
                .setLabel(item.label)
                .setStyle(ButtonStyle.Secondary)
        );

        const rows = [];

        for (let i = 0; i < buttons.length; i += 5) {
            rows.push(
                new ActionRowBuilder()
                    .addComponents(
                        buttons.slice(i, i + 5)
                    )
            );
        }

              try {
            await channel.send({
                content: title,

                files: [
                    {
                        attachment: imageBuffer,
                        name: `role-panel.${extension}`
                    }
                ],

                components: rows
            });
        } catch (error) {
            console.error(
                'ROLE PANEL SEND ERROR:',
                error
            );

            return interaction.editReply(
                'I could not send the role panel.'
            );
        }

        await interaction.editReply(
            `Role panel created in ${channel}.`
        );
    }
};
