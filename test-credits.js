// Test Credit Update System
// Run this in your browser console on localhost:5173

async function testCreditUpdate() {
    console.log('🧪 Testing Credit Update System...');

    try {
        // 1. Check current user credits
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error('❌ No user logged in');
            return;
        }

        console.log('👤 User ID:', user.id);

        // 2. Get current credits
        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('credits, email, updated_at')
            .eq('id', user.id)
            .single();

        if (fetchError) {
            console.error('❌ Error fetching user data:', fetchError);
            return;
        }

        console.log('💰 Current credits:', userData.credits);
        console.log('📧 Email:', userData.email);
        console.log('🕒 Last updated:', userData.updated_at);

        // 3. Test manual credit update (simulate payment)
        console.log('🔄 Testing manual credit update...');

        const { data: updateData, error: updateError } = await supabase.functions.invoke('process-payment-manual', {
            body: {
                sessionId: 'test-session-' + Date.now(),
                userId: user.id,
                productId: 'starter', // 1000 credits
                email: userData.email
            }
        });

        if (updateError) {
            console.error('❌ Manual credit update failed:', updateError);
        } else {
            console.log('✅ Manual credit update result:', updateData);
        }

        // 4. Check updated credits
        const { data: updatedUserData, error: updatedFetchError } = await supabase
            .from('users')
            .select('credits, updated_at')
            .eq('id', user.id)
            .single();

        if (updatedFetchError) {
            console.error('❌ Error fetching updated user data:', updatedFetchError);
        } else {
            console.log('💰 Updated credits:', updatedUserData.credits);
            console.log('🕒 New last updated:', updatedUserData.updated_at);

            const creditsAdded = updatedUserData.credits - userData.credits;
            console.log('➕ Credits added:', creditsAdded);
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testCreditUpdate();
