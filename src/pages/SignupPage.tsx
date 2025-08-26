function SignupPage() {
return (
    <div>
        <div className="signLog-container">
            <h1>Sign Up</h1>
            <form>
                <label>
                Email:
                <input type="email" name="email" required />
                </label>
            </form>
            <form>
                <label>
                Password:
                <input type="password" name="password" required />
                </label>
            </form>
            <button type="submit">Sign Up</button>
        </div>
    </div>
  )
}

export default SignupPage;
