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
        .setDescription('Create a button-based role panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Channel to send the role panel in')
                .addChannelTypes(
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('title')
                .setDescription('Text displayed above the image')
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
        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('title');
        const image = interaction.options.getString('image');

        const botMember = interaction.guild.members.me;

        if (
            !botMember.permissions.has(PermissionFlagsBits.ManageRoles)
        ) {
            return interaction.reply({
                content: 'I need the **Manage Roles** permission.',
                flags: MessageFlags.Ephemeral
            });
        }

        const roles = [];

        for (let i = 1; i <= 5; i++) {
            const role = interaction.options.getRole(`role${i}`);
            const label = interaction.options.getString(`label${i}`);

            if (!role && !label) continue;

            if (!role || !label) {
                return interaction.reply({
                    content: `Role ${i} needs both a role and a button label.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            if (role.id === interaction.guild.id) {
                return interaction.reply({
                    content: 'You cannot use the @everyone role.',
                    flags: MessageFlags.Ephemeral
                });
            }

            if (role.managed) {
                return interaction.reply({
                    content: `${role.name} is managed by another integration and cannot be assigned.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            if (role.position >= botMember.roles.highest.position) {
                return interaction.reply({
                    content:
                        `I cannot assign **${role.name}** because my bot role is below it.\n\n` +
                        `Move the Charm role above **${role.name}** in Server Settings → Roles.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            roles.push({
                role,
                label
            });
        }

        const row = new ActionRowBuilder();

        for (const item of roles) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`charm_role_${item.role.id}`)
                    .setLabel(item.label)
                    .setStyle(ButtonStyle.Secondary)
            );
        }

        try {
            await channel.send({
                content: `${title}\n${image}`,
                components: [row]
            });

            await interaction.reply({
                content: `Role panel created in ${channel}.`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error(error);

            await interaction.reply({
                content: 'I could not create the role panel.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};