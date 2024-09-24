import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';
import { UserSession, showConnect } from '@stacks/connect';

// Mock the necessary modules
vi.mock('@stacks/connect', () => ({
    AppConfig: vi.fn(),
    UserSession: vi.fn(() => ({
        isUserSignedIn: vi.fn(),
        loadUserData: vi.fn(),
    })),
    showConnect: vi.fn(),
}));

describe('App Component', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    test('renders the app title', () => {
        render(<App />);
        const titleElement = screen.getByText(/Luxury Goods UI/i);
        expect(titleElement).toBeInTheDocument();
    });

    test('renders connect wallet button when user is not connected', () => {
        render(<App />);
        const buttonElement = screen.getByText(/Connect Wallet/i);
        expect(buttonElement).toBeInTheDocument();
    });

    test('renders wallet connected button when user is connected', () => {
        const mockUserSession = new UserSession();
        mockUserSession.isUserSignedIn.mockReturnValue(true);
        mockUserSession.loadUserData.mockReturnValue({
            profile: {
                stxAddress: { testnet: 'test-address' },
            },
        });

        render(<App />);
        const buttonElement = screen.getByText(/Wallet Connected/i);
        expect(buttonElement).toBeInTheDocument();
    });

    test('calls showConnect when connect wallet button is clicked', () => {
        render(<App />);
        const buttonElement = screen.getByText(/Connect Wallet/i);
        fireEvent.click(buttonElement);
        expect(showConnect).toHaveBeenCalled();
    });

    test('sets user address in session storage on connect', () => {
        const mockUserSession = new UserSession();
        mockUserSession.isUserSignedIn.mockReturnValue(false);
        mockUserSession.loadUserData.mockReturnValue({
            profile: {
                stxAddress: { testnet: 'test-address' },
            },
        });

        showConnect.mockImplementation(({ onFinish }) => {
            onFinish();
        });

        render(<App />);
        const buttonElement = screen.getByText(/Connect Wallet/i);
        fireEvent.click(buttonElement);

        expect(sessionStorage.getItem('userAddress')).toBe(JSON.stringify('test-address'));
    });
});