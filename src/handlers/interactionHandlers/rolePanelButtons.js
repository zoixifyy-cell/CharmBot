import {
    PermissionFlagsBits,
    MessageFlags
} from 'discord.js';

export async function handleRolePanelButton(interaction) {
    if (!interaction.isButton()) return false;

    if (!interaction.customId.startsWith('charm_role_')) {
        return false;
    }

    const roleId = interaction.customId.replace(
        'charm_role_',
        ''
    );

    const guild = interaction.guild;

    if (!guild) {
        await interaction.reply({
            content: 'This button can only be used inside a server.',
            flags: MessageFlags.Ephemeral
        });

        return true;
    }

    const role = guild.roles.cache.get(roleId);

    if (!role) {
        await interaction.reply({
            content: 'That role no longer exists.',
            flags: MessageFlags.Ephemeral
        });

        return true;
    }

    const botMember = guild.members.me;

    if (
        !botMember.permissions.has(
            PermissionFlagsBits.ManageRoles
        )
    ) {
        await interaction.reply({
            content: 'I no longer have permission to manage roles.',
            flags: MessageFlags.Ephemeral
        });

        return true;
    }

    if (role.position >= botMember.roles.highest.position) {
        await interaction.reply({
            content: 'I cannot manage that role because it is above my bot role.',
            flags: MessageFlags.Ephemeral
        });

        return true;
    }

    const member = await guild.members.fetch(
        interaction.user.id
    );

    try {
        if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);

            await interaction.reply({
                content: `Removed **${role.name}** ♡`,
                flags: MessageFlags.Ephemeral
            });
        } else {
            await member.roles.add(role);

            await interaction.reply({
                content: `Added **${role.name}** ♡`,
                flags: MessageFlags.Ephemeral
            });
        }
    } catch (error) {
        console.error(error);

        await interaction.reply({
            content: 'I could not update your role.',
            flags: MessageFlags.Ephemeral
        });
    }

    return true;
}
