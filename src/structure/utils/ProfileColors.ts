import ProfileType from '../../types/ProfileType';

const ProfileColors: Record<ProfileType, { text: string, progress: string }> = {
    'DEFAULT': {
        text: '#8c8c8c',
        progress: '#8c8c8c'
    },
    'JAPAN': {
        text: '#ff0000',
        progress: '#ac0000'
    },
    'SPRING': {
        text: '#BFE989',
        progress: '#FFFFFF7F'
    },
    'CLOUD': {
        text: '#FFFFFF',
        progress: '#FFFFFF7F'
    },
    'PREMIUM': {
        text: '',
        progress: ''
    }
};
export default ProfileColors;