import {
    PermissionFlagsBits,
    MessageFlags
} from 'discord.js';

export async function handleRolePanelButton(interaction) {
    if (!interaction.isButton()) return false;

    if (!interaction.customId.startsWith('charm_role_')) {
        return false;
    }

    // Respond immediately so Discord doesn't time out.
    await interaction.deferReply({
        flags: MessageFlags.Ephemeral
    });

    const roleId = interaction.customId.replace(
        'charm_role_',
        ''
    );

    const guild = interaction.guild;

    if (!guild) {
        await interaction.editReply(
            'This button can only be used inside a server.'
        );

        return true;
    }

    const role = guild.roles.cache.get(roleId);

    if (!role) {
        await interaction.editReply(
            'That role no longer exists.'
        );

        return true;
    }

    const botMember = guild.members.me;

    if (
        !botMember.permissions.has(
            PermissionFlagsBits.ManageRoles
        )
    ) {
        await interaction.editReply(
            'I no longer have permission to manage roles.'
        );

        return true;
    }

    if (role.position >= botMember.roles.highest.position) {
        await interaction.editReply(
            'I cannot manage that role because it is above my bot role.'
        );

        return true;
    }

    try {
        const member = await guild.members.fetch(
            interaction.user.id
        );

        if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);

            await interaction.editReply(
                `Removed **${role.name}** ♡`
            );
        } else {
            await member.roles.add(role);

            await interaction.editReply(
                `Added **${role.name}** ♡`
            );
        }
    } catch (error) {
        console.error('ROLE PANEL ERROR:', error);

        await interaction.editReply(
            'I could not update your role. Check my Manage Roles permission and role position.'
        );
    }

    return true;
}
