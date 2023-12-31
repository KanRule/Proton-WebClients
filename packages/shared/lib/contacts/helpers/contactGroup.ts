import { ContactGroupLimitReachedProps } from '@proton/components/containers/contacts/modals/ContactGroupLimitReachedModal';
import { CONTACT_GROUP_MAX_MEMBERS } from '@proton/shared/lib/contacts/constants';
import { ContactEmail } from '@proton/shared/lib/interfaces/contacts';

/**
 * Contact groups are limited to 100 contacts. When editing a contact, we do not save directly since the contact might not exist.
 * Instead, we're doing a delayed save. However, we still need to check that adding the contact to the contact group will be a valid operation.
 * If the change is valid, we return them, otherwise we need to remove the contact group from the changes requested, and display a modal
 */
export const getContactGroupsDelayedSaveChanges = ({
    userContactEmails,
    changes,
    initialModel,
    model,
    onLimitReached,
}: {
    userContactEmails: ContactEmail[];
    changes: { [groupID: string]: boolean };
    model: { [groupID: string]: number };
    initialModel: { [groupID: string]: number };
    onLimitReached?: (props: ContactGroupLimitReachedProps) => void;
}) => {
    // Get number of contacts in saved contact groups
    const groupIDs = Object.keys(changes);

    const cannotAddContactInGroupIDs: string[] = [];

    groupIDs.forEach((groupID) => {
        const groupExistingMembers =
            groupID &&
            userContactEmails.filter(({ LabelIDs = [] }: { LabelIDs: string[] }) => LabelIDs.includes(groupID));

        // Check that adding the current contact would not exceed the limit
        const canAddContact = groupExistingMembers.length < CONTACT_GROUP_MAX_MEMBERS;

        if (!canAddContact) {
            cannotAddContactInGroupIDs.push(groupID);
        }
    });

    // If some addition were exceeding the limit, we remove them from the change array and display a modal to inform the user
    if (cannotAddContactInGroupIDs.length > 0) {
        const updatedChanges = Object.entries(model).reduce<{
            [groupID: string]: boolean;
        }>((acc, [groupID, isChecked]) => {
            if (isChecked !== initialModel[groupID] && !cannotAddContactInGroupIDs.includes(groupID)) {
                acc[groupID] = isChecked === 1;
            }
            return acc;
        }, {});

        onLimitReached?.({ groupIDs: cannotAddContactInGroupIDs });
        return updatedChanges;
    } else {
        return changes;
    }
};
